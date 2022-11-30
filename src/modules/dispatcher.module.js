export default class Dispatcher {
    #events = {};
    // TODO these are personal, shouldn't be here...
    #EVENT_TYPES = {
        AREA_OCCUPIED: "areaOccupied",
        AREA_UNOCCUPIED: "areaUnoccupied",
        MOTION_TRIGGERED: "motionTriggered",
        MOTION_CLEARED: "motionCleared",
        OCCUPANCY_TRIGGERED: "occupancyTriggered",
        OCCUPANCY_CLEARED: "occupancyCleared",
        LIGHT_ON: "lightOn",
        LIGHT_OFF: "lightOff",
        DOOR_OPENED: "doorOpened",
        DOOR_CLOSED: "doorClosed",
        WINDOW_OPENED: "windowOpened",
        WINDOW_CLOSED: "windowClosed",
        TIMER_STARTED: "timerStarted",
        TIMER_CANCELLED: "timerCancelled",
        TIMER_FINISHED: "timerFinished",
        TIMER_PAUSED: "timerPaused",
        TIMER_RESTARTED: "timerRestarted",
        HEAT_CHANGE: "heatChange",
        BOOLEAN_ON: "booleanOn",
        BOOLEAN_OFF: "booleanOff",
        HUMIDITY_CHANGE: "humidityChange",
        TEMPERATURE_CHANGE: "temperatureChange",
        IAQ_CHANGE: "iaqChange",
        DEVICE_ON: "deviceOn",
        DEVICE_OFF: "deviceOff",
        DARK_TRIGGERED: "brightnessChange",
        LIGHT_TRIGGERED: "lightTriggered"
    }
    constructor () {
    }

    get eventTypes() {
        return this.#EVENT_TYPES;
    }

    addListener (event, callback) {
        // Check if the callback is not a function
        if (typeof callback !== 'function') {
            console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
            return false;
        }


        // Check if the event is not a string
        if (typeof event !== 'string') {
            console.error(`The event name must be a string, the given type is ${typeof event}`);
            return false;
        }

        // Check if this event not exists
        if (typeof this.#events[event] === "undefined") {
            this.#events[event] = {
                listeners: []
            }
        }

        this.#events[event].listeners.push(callback);
    }

    removeListener (event, callback) {
        // Check if this event not exists
        if (typeof this.#events[event] === "undefined") {
            console.error(`This event: ${event} does not exist`);
            return false;
        }

        this.#events[event].listeners = this.#events[event].listeners.filter(listener => {
            return listener.toString() !== callback.toString();
        });
    }

    dispatch (event, details) {
        // Check if this event not exists
        if (typeof this.#events[event] === "undefined") {
            console.warn(`This event: ${event} does not exist... skipping dispatch`);
            return;
        }

        this.#events[event].listeners.forEach((listener) => {
            if(!listener){
                console.warn(`This event: ${listener} does not exist... skipping dispatch`);
                return;
            }
            listener(details);
        });
    }
}