import { join, resolve } from "path";
import { homedir } from "os";
import fse from "fs-extra";
import { returnCliPathArgument } from "../util/args";

let appDaemonConfig;

class DefaultConfigModule {
    #CONFIG_DIR = returnCliPathArgument() || join(homedir(), ".appdaemon-js");
    #CUSTOM_APP_DIR = process.env.APPDAEMONJS_CONFIG_APP_DIR || join(this.#CONFIG_DIR, "apps");
    #CONFIG_FILE_PATH = process.env.APPDAEMONJS_CONFIG_FILE_PATH || join(this.#CONFIG_DIR, "config.js");
    #COPY_OPTIONS = {
        overwrite: false,
        errorOnExist: false
    };

    constructor(){
        this.loadConfiguration()
    }

    get configDirectory(){
        return this.#CONFIG_DIR
    }

    get conifgFilePath(){
        return this.#CONFIG_FILE_PATH
    }

    get configAppDirectory(){
        return this.#CUSTOM_APP_DIR
    }

    loadConfiguration(){
        if (!fse.existsSync(this.#CONFIG_FILE_PATH)) {
            this.createRequiredFolderStructure();
            this.copyDefaultApplicationsAndConfig()
            this.printFinishedMessageAndEndProcess()
        }
    }

    printFinishedMessageAndEndProcess(){
        console.log("Congratulations! You have successfully installed and a default config has been created!");
        console.log("Please set up your config in "+ this.#CONFIG_FILE_PATH + " and run appdaemon-js again.");
        process.exit();
    }

    createRequiredFolderStructure(){
        [this.#CONFIG_DIR, this.#CUSTOM_APP_DIR].forEach(path => fse.ensureDirSync(path));
    }

    copyDefaultApplicationsAndConfig(){
        fse.copySync( join(__dirname, "../../../sample_config_dir/apps/energySaver.js"), join(this.#CUSTOM_APP_DIR, "energySaver.js"), this.#COPY_OPTIONS );
        fse.copySync( join(__dirname, "../../../sample_config_dir/apps/helloWorld.js"), join(this.#CUSTOM_APP_DIR, "helloWorld.js"), this.#COPY_OPTIONS );
        fse.copySync( join(__dirname, "../../../sample_config_dir/apps/printEntities.js"), join(this.#CUSTOM_APP_DIR, "printEntities.js"), this.#COPY_OPTIONS );
        fse.copySync( resolve(__dirname, "../../../sample_config_dir/config.js"), this.#CONFIG_FILE_PATH, this.#COPY_OPTIONS );
    }
}

if(!appDaemonConfig){
    appDaemonConfig = new DefaultConfigModule()
}

export default appDaemonConfig;