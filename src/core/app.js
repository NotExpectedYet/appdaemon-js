#!/usr/bin/env node
import WebSocket from "ws";
global.WebSocket = WebSocket;
import appDaemonConfig from "../modules/default-config,module";
import applicationsManager from "../modules/application-manager.module";
import HassConnectionManagerModule from "../modules/hass-connection-manager.module";
import LoggerService from "../modules/logger.module"



(async () => {
    const log = new LoggerService("appDaemon.js")
    log.info("Loaded Configuration: ", appDaemonConfig.configDirectory)

    const config = require(appDaemonConfig.conifgFilePath).default;
    //TODO: move over to dynamic imports not requires, keeps everything a module...
    //const config = await import(appDaemonConfig.conifgFilePath).default;

    log.info(`Found ${applicationsManager.appCount} applications!`)

    const hassConnectionManager = new HassConnectionManagerModule(config.appDaemon)

    hassConnectionManager.createHassConnection().then(hassConnection => {
        const { utils, conn, commands, logger, listeners, events, tasks } = hassConnection;
        applicationsManager.loadEnabledApplications(conn, utils, listeners, logger, commands, config.apps, events, tasks)
    }).catch(e => {
        log.error("FATAL ERROR!", e.toString())
        process.exit()
    });
})();



