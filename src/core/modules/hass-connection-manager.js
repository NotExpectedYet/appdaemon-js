import * as haWs from "home-assistant-js-websocket";
import { getDomainFromEntityID } from "../util/string";
import { createServiceDataObject } from "../util/objects"

export default class HassConnectionManager {
    #HASS_URL;
    #AUTH;
    #CONNECTION;
    #UTILITIES;
    #LISTENERS;
    #COMMANDS;

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
            this.createCommandsObject();
            return {
                conn: this.#CONNECTION,
                utils: this.#UTILITIES,
                commands: this.#COMMANDS,
                listeners: this.#LISTENERS
            };
        }catch (e){
            console.error(e)
            process.exit();
        }
    }

    createUtilitiesObject() {
        this.#UTILITIES = {
            callService: async (domain, service, serviceData = undefined, target = undefined) => await haWs.callService(this.#CONNECTION, domain, service, serviceData, target),
            getStates: async () => await haWs.getStates(this.#CONNECTION),
        }
    }

    createCommandsObject() {
        this.#COMMANDS = {
            turnOn: async (entity_id, serviceData) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_on", createServiceDataObject(entity_id, serviceData))
            },
            turnOff: async (entity_id, serviceData) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_off", createServiceDataObject(entity_id, serviceData))
            },
            toggle: async (entity_id, serviceData) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "toggle", createServiceDataObject(entity_id, serviceData))
            },
        }
    }

    createListenersObject() {
        this.#LISTENERS = {
            subscribeEntitiesStateChange: (func, entities = undefined, old_state = undefined, new_state = undefined) => this.#CONNECTION.subscribeEvents((evt) => {
                if(evt.event_type !== "state_changed") return

                if(!entities) return func(evt.data)

                let entitiesCondition = true;
                let newStateCondition = true;
                let oldStateCondition = true;

                if(entities){
                    entitiesCondition = entities.indexOf(evt.data.entity_id) > -1
                }

                if(new_state){
                    newStateCondition = evt.data.new_state.state === new_state
                }

                if(old_state){
                    oldStateCondition = evt.data.old_state.state === old_state
                }

                if(evt.event_type === "state_changed" && entitiesCondition && newStateCondition && oldStateCondition){
                    func(evt.data)
                }
            })
        }
    }
}