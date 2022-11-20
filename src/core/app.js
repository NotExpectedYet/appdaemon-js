#!/usr/bin/env node
import WebSocket from "ws";
global.WebSocket = WebSocket;
import appDaemonConfig from "../modules/default-config";
import applicationsManager from "../modules/application-manager";
import HassConnectionManager from "../modules/hass-connection-manager";

// TODO import logging for use inside app

(async () => {
    console.log("Loaded Configuration: ", appDaemonConfig.configDirectory)

    const config = require(appDaemonConfig.conifgFilePath).default;
    //TODO: move over to dynamic imports not requires, keeps everything a module...
    //const config = await import(appDaemonConfig.conifgFilePath).default;

    console.log(`Found ${applicationsManager.appCount} applications!`)

    const hassConnectionManager = new HassConnectionManager(config.appDaemon)

    hassConnectionManager.createHassConnection().then(hassConnection => {
        const { utils, conn, commands, logger, listeners } = hassConnection;
        applicationsManager.loadEnabledApplications(conn, utils, listeners, logger, commands, config.apps)
    }).catch(e => {
        console.error("FATAL ERROR!", e.toString())
        process.exit()
    });
})();



