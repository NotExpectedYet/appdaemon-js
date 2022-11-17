#!/usr/bin/env node
import WebSocket from "ws";
global.WebSocket = WebSocket;
import appDaemonConfig from "./modules/default-config";
import applicationsManager from "./modules/application-manager";
import HassConnectionManager from "./modules/hass-connection-manager";

console.log("Loaded Configuration: ", appDaemonConfig.configDirectory)

const config = require(appDaemonConfig.conifgFilePath).default;

console.log(`Found ${applicationsManager.appCount} applications!`)

const hassConnectionManager = new HassConnectionManager(config.appDaemon)

hassConnectionManager.createHassConnection().then(hassConnection => {
    const { utils, conn, commands, listeners } = hassConnection;
    applicationsManager.loadEnabledApplications(conn, utils, listeners, commands, config.apps)
}).catch(e => {
    console.error("FATAL ERROR!", e.toString())
    process.exit()
});