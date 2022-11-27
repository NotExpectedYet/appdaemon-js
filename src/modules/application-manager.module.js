import { join } from "path";
import fse from "fs-extra";
import appDaemonConfig from "./default-config,module";
import LoggerService from "./logger.module"

let applicationsManager;

class ApplicationManagerModule {
    #APPS;
    #LOGGER;

    constructor() {
        this.#LOGGER = new LoggerService("appDaemon.js - Application Manager")
        this.parseApplicationsDirectory();
    }

    get apps() {
        return this.#APPS
    }

    get appCount() {
        return this.#APPS.length;
    }

    parseApplicationsDirectory() {
        try {
            this.#APPS = fse.readdirSync(appDaemonConfig.configAppDirectory).map(file => {
                return {
                    name: file.slice(0, -3),
                    //TODO: look into dynamic importing here..
                    app: require(join(appDaemonConfig.configAppDirectory, file)).app
                };
            });
        } catch (err) {
            this.#LOGGER.error("Unable to parse app directory!", err.toString())
        }
    }

    loadEnabledApplications(connection, utils, listeners, logger, commands, appConfig, events){
        this.#APPS.filter(app => appConfig[app.name] && appConfig[app.name].enable).forEach(app => {
            this.#LOGGER.info("Application has been enabled! " + app.name)
            let appDaemon = {
                utils,
                listeners,
                commands,
                logger,
                events,
                config: {
                    entities: appConfig[app.name]?.entities || [],
                    settings: appConfig[app.name]?.settings || []
                }
            };
            try{
                app.app(appDaemon)
            }catch(e){
                this.#LOGGER.error(`Error! ${app.name} has an issue! \n ${e.toString()}`)
            }

        });
    }
}

if(!applicationsManager){
    applicationsManager = new ApplicationManagerModule();
}

export default applicationsManager;