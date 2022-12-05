import * as haWs from "home-assistant-js-websocket";
import { getDomainFromEntityID } from "../util/string";
import { createEntityTargetObject, createServiceDataObject, createScriptDataObject } from "../util/objects"
import { everyItem, someItems } from "../util/array";
import { breakOutNewOldStates } from "../util/objects";
import { getEntityFromEntityID } from "../util/string";
import { delay_seconds } from "../../lib/util/promise";
import LoggerService from "./logger.module"
import {dateInTheFuture} from "../util/dates";
import Dispatcher from "./dispatcher.module";
import TaskManager from "./tasks.module";
import MemoryStoreModule from "./memory-store.module";

const LOGGER = new LoggerService("appdaemon.js - Hass Connection Manager")


export default class HassConnectionManagerModule {
    #HASS_URL;
    #AUTH;
    #CONNECTION;
    #UTILITIES;
    #LISTENERS;
    #COMMANDS;
    #EVENTS;
    #TASKS;
    #STORE;
    #APPLICATION_LOGGER;

    constructor(config) {
        if (!config?.haUrl || !config?.port || !config?.haKey) {
            LOGGER.error("HaURL: " + config.haUrl, "Port: " + config.port, "HaKey: " + config.haKey)
            throw new Error("Missing configuration keys!")
        }
        this.#APPLICATION_LOGGER = (route) => {
            return new LoggerService(route, true)
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
            this.createEventsManager();
            this.createTasksManager();
            this.createInMemoryStore();
            return {
                conn: this.#CONNECTION,
                utils: this.#UTILITIES,
                listeners: this.#LISTENERS,
                commands: this.#COMMANDS,
                logger: this.#APPLICATION_LOGGER,
                events: this.#EVENTS,
                tasks: this.#TASKS,
                store: this.#STORE
            };
        }catch (e){
            LOGGER.error("Error creating hass connection! exiting...", e.toString())
            process.exit();
        }
    }

    createTasksManager() {
        this.#TASKS = new TaskManager();
    }

    createEventsManager() {
        this.#EVENTS = new Dispatcher();
    }

    createInMemoryStore() {
        this.#STORE = new MemoryStoreModule();
    }

    createUtilitiesObject() {
        this.#UTILITIES = {
            //TODO move these out to base classes
            //getServices: async (filter) => await haWs.getServices(this.#CONNECTION),
            //getConfig: async (filtere) => await haWs.getConfig(this.#CONNECTION)
            callService: async (domain, service, serviceData = undefined, target = undefined) => {
                try {
                    return haWs.callService(this.#CONNECTION, domain, service, serviceData, target);
                } catch (e) {
                    LOGGER.error(`Failed to call service`, {domain, service, serviceData, target})
                    LOGGER.error(e)
                }


            },
            // BELOW ARE THE UTILITY CLASSES
            getEntityState: async (filter) => {
                try {
                    const states = await haWs.getStates(this.#CONNECTION)
                    return states.filter((v) => v.entity_id === filter)[0]
                } catch (e) {
                    LOGGER.error(`Failed to get entity state ${e.toString()}`, filter)
                }

            },
            getEntitiesState: async (filter) => {
                try {
                    const states = await haWs.getStates(this.#CONNECTION)
                    return states.filter((v) => v.entity_id.includes(filter))
                } catch (e) {
                    LOGGER.error(`Failed to get entities states ${e.toString()}`, filter)
                }
            },
            everyEntity: async (entities, key, match) => {
                try {
                    if(entities.length < 1) return false;
                    const currentStates = await this.#UTILITIES.getEntitiesState(entities);
                    return everyItem(currentStates, key, match)
                } catch (e) {
                    LOGGER.error(`Failed to check every entity ${e.toString()}`, { entities, key, match })
                }
            },
            someEntities: async (entities, key, match) => {
                try {
                    if(entities.length < 1) return false;
                    const currentStates = await this.#UTILITIES.getEntitiesState(entities);
                    return someItems(currentStates, key, match)
                } catch (e) {
                    LOGGER.error(`Failed to check some entities states ${e.toString()}`, {entities, key, match})
                }


            },
            delaySeconds: async (seconds) => {
                try {
                    return delay_seconds(seconds)
                } catch (e) {
                    LOGGER.error(`Failed to delay ${e.toString()}`, seconds)
                }


            },
            splitOutEntityID: (entity) => {
                try {
                    return getEntityFromEntityID(entity)
                } catch (e) {
                    LOGGER.error(`Failed to get entity from id ${e.toString()}`, entity)
                }


            },
            splitOutNewOldState: (evt) => {
                try {
                    return breakOutNewOldStates(evt)
                } catch (e) {
                    LOGGER.error(`Failed to split out new/old states ${e.toString()}`, evt)
                }

            },
            isFutureDate: date => dateInTheFuture(date)

        }
    }

    createCommandsObject() {
        this.#COMMANDS = {
            turnOn: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_on", {}, createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to turn on a ${getDomainFromEntityID(entity_id)}`,e.toString())
                }
            },
            turnOff: async (entity_id, serviceData = {}) => {

                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_off", {}, createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to turn off a ${getDomainFromEntityID(entity_id)}`, e.toString())
                }
            },
            toggle: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "toggle", {}, createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to toggle a ${getDomainFromEntityID(entity_id)}`, e.toString())
                }
            },
            setValue: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "set_value", createServiceDataObject(serviceData), createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to set value of ${getDomainFromEntityID(entity_id)}`, e.toString())
                }
            },
            startTimer: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "start", {}, createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error("Failed to start a timer", e.toString())
                }
            },
            pauseTimer: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "pause", {}, createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error("Failed to pause a timer", e.toString())
                }
            },
            finishTimer: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "finish", {}, createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error("Failed to finish a timer", e.toString())
                }
            },
            cancelTimer:  async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "cancel", {}, createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error("Failed to finish a timer", e.toString())
                }
            },
            fireScript: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "turn_on", createScriptDataObject(serviceData), createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to fire a Script: ${serviceData, entity_id}`, e.toString())
                }

            },
            setHVACMode: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "set_hvac_mode", createServiceDataObject(serviceData), createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to set HVAC Mode: ${serviceData, entity_id}`, e)
                }
            },
            setHVACTarget: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "set_temperature", createServiceDataObject(serviceData), createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to set HVAC Mode: ${serviceData, entity_id}`, e)
                }
            },
            setHumidifierTarget: async (entity_id, serviceData = {}) => {
                try {
                    await this.#UTILITIES.callService(getDomainFromEntityID(entity_id), "set_humidity", createServiceDataObject(serviceData), createEntityTargetObject(entity_id))
                } catch (e) {
                    LOGGER.error(`Failed to set HVAC Mode: ${serviceData, entity_id}`, e)
                }
            },

        }
    }

    createListenersObject() {
        this.#LISTENERS = {
            /**
             * Subsribe to entities
             * @callback {func} callback function you'd like the event data to be passed through too
             * @param {array} entities array of entities
             * @param old_state string with state to match
             * @param new_state string with state to match
             * @returns {Promise<SubscriptionUnsubscribe>}
             */
            subscribeEntitiesStateChange: (func, entities = undefined, old_state = undefined, new_state = undefined) => this.#CONNECTION.subscribeEvents((evt) => {
                if(evt.event_type !== "state_changed") return
                try{
                    if(!entities) return func(evt.data)
                }catch(e){
                    console.error(`Failed to subscribe to entity state change ${e.toString()}`)
                }


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
                    try{
                        func(evt.data)
                    }catch(e){
                        LOGGER.error(`Failed to callback subscribe entity ${e.toString()}`)
                    }

                }
            }),
            subscribeToTimerEvents: (func, entities = undefined, type = undefined) => this.#CONNECTION.subscribeEvents((evt) => {
                if(!evt.event_type.includes("timer")) return

                try {
                    if(!entities) return func(evt)
                } catch (e) {
                    LOGGER.error(`Failed to callback timer events, ${e.toString()}`)
                }

                let entitiesCondition = true;
                let typeCondition = true;

                if(entities){
                    entitiesCondition = entities.indexOf(evt.data.entity_id) > -1
                }

                if(type){
                    typeCondition = evt.event_type === type
                }

                if(entitiesCondition && typeCondition){
                    try {
                        func(evt)
                    } catch (e) {
                        LOGGER.error(`Failed to callback timer events, ${e.toString()}`)
                    }
                }
            }),
        }
    }
}