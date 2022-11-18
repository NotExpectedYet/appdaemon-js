import * as haWs from "home-assistant-js-websocket";
import { getDomainFromEntityID } from "../util/string";
import {createEntityTargetObject, createServiceDataObject, createTargetObject} from "../util/objects"

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
                listeners: this.#LISTENERS,
                commands: this.#COMMANDS
            };
        }catch (e){
            console.error(e)
            process.exit();
        }
    }

    createUtilitiesObject() {
        this.#UTILITIES = {
            //callService: async (domain, service, serviceData = undefined, target = undefined) => await haWs.callService(this.#CONNECTION, domain, service, serviceData, target),
            getEntityState: async (filter) => {
                const states = await haWs.getStates(this.#CONNECTION)
                return states.filter((v) => v.entity_id === filter)[0]
            },
            getEntitiesState: async (filter) => {
                const states = await haWs.getStates(this.#CONNECTION)
                return states.filter((v) => v.entity_id.includes(filter))
            },
            //getServices: async (filter) => await haWs.getServices(this.#CONNECTION),
            //getConfig: async (filtere) => await haWs.getConfig(this.#CONNECTION)
            callService: async (domain, service, serviceData = undefined, target = undefined) => haWs.callService(this.#CONNECTION, domain, service, serviceData, target),
        }
    }

    createCommandsObject() {
        this.#COMMANDS = {
            turnOn: async (entity_id, serviceData = {}) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_on", {}, createEntityTargetObject(entity_id))
            },
            turnOff: async (entity_id, serviceData = {}) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_off", {}, createEntityTargetObject(entity_id))
            },
            toggle: async (entity_id, serviceData = {}) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "toggle", {}, createEntityTargetObject(entity_id))
            },
            startTimer: async (entity_id, serviceData = {}) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "start", {}, createEntityTargetObject(entity_id))
            },
            pauseTimer: async (entity_id, serviceData = {}) => {
                return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "pause", {}, createEntityTargetObject(entity_id))
            },
            fireScript: async (entity_id, serviceData = {}) => {
                try {
                    return this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_on", createServiceDataObject(serviceData), createEntityTargetObject(entity_id))
                } catch (e) {
                    console.error(e.toString())
                }

            }
        }
    }

    createListenersObject() {
        this.#LISTENERS = {
            /**
             * Subsribe to entities
             * @param func callback function you'd like the event data to be passed through too
             * @param entities array of entities
             * @param old_state string with state to match
             * @param new_state string with state to match
             * @returns {Promise<SubscriptionUnsubscribe>}
             */
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