import * as haWs from "home-assistant-js-websocket";

export default class HassConnectionManager {
    #HASS_URL;
    #AUTH;
    #CONNECTION;
    #UTILITIES;
    #LISTENERS;

    constructor(config) {
        if (!config?.haUrl || !config?.port || !config?.haKey) {
            console.log("HaURL: " + config.haUrl, "Port: " + config.port, "HaKey: " + config.haKey, )
            throw new Error("Missing configuration keys!")
        }

        this.createHassAuthentication(config)
    }

    get hassConnection() {
        return this.#CONNECTION;
    }

    buildHassURL(haURL, port, encrypted) {
        const url = `http${encrypted ? "s" : ""}://${haURL}${port ? ":" + port : ""}`
        this.#HASS_URL = url;
        return url;
    }

    createHassAuthentication({haUrl, port, encryption, haKey}) {
        this.#AUTH = haWs.createLongLivedTokenAuth(
            this.buildHassURL(
                haUrl,
                port,
                encryption || false
            ), haKey
        );
    }

    async createHassConnection() {
        try{
            this.#CONNECTION = await haWs.createConnection({auth: this.#AUTH})
            this.createUtilitiesObject();
            this.createListenersObject();
            return {
                conn: this.#CONNECTION,
                utils: this.#UTILITIES,
                listeners: this.#LISTENERS
            };
        }catch (e){
            console.error(e)
            process.exit();
        }
    }

    createUtilitiesObject() {
        this.#UTILITIES = {
            callService: haWs.callService,
        }
    }

    createListenersObject() {
        this.#LISTENERS = {
            subscribeToEvent: (evt) => this.#CONNECTION.subscribeEvents(evt)
        }
    }
}