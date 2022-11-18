import { join } from "path";
import fse from "fs-extra";
import appDaemonConfig from "./default-config";

let applicationsManager;

class ApplicationManager {
    #APPS

    constructor() {
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
                    app: require(join(appDaemonConfig.configAppDirectory, file)).app
                };
            });
        } catch (err) {
            console.error(err);
        }
    }

    loadEnabledApplications(connection, utils, listeners, commands, appConfig){
        this.#APPS.filter(app => appConfig[app.name] && appConfig[app.name].enable).forEach(app => {
            console.log(app.name + " enabled");
            let appDaemon = {
                utils,
                listeners,
                commands,
                config: {
                    entities: appConfig[app.name]?.entities || [],
                    settings: appConfig[app.name]?.settings || []
                }
            };
            try{
                app.app(appDaemon)
            }catch(e){
                console.error(`Error! ${app.name} has an issue! \n ${e.toString()}`)
            }

        });
    }
}

if(!applicationsManager){
    applicationsManager = new ApplicationManager();
}

export default applicationsManager;