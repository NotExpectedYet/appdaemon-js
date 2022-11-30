import winston from "winston"
import appDaemonConfig from "./default-config,module";
import { join } from "path";

const dtFormat = new Intl.DateTimeFormat("en-GB", {
    timeStyle: "medium",
    dateStyle: "short",
    timeZone: "UTC"
});

const COLOURS = {
    RED: "\x1b[31m",
    YELLOW: "\x1b[33m",
    ORANGE: "\x1b[31m",
    BLUE: "\x1b[34m",
    PURPLE: "\x1b[35m",
    WHITE: "\x1b[37m",
    CYAN: "\x1b[36m"
};

const COLOUR_MAP = {
    info: COLOURS.BLUE,
    warn: COLOURS.YELLOW,
    debug: COLOURS.ORANGE,
    error: COLOURS.RED,
    http: COLOURS.PURPLE,
    silly: COLOURS.CYAN,
    commands: COLOURS.PURPLE,
    utils: COLOURS.ORANGE,
    events: COLOURS.BLUE
};

const LEVELS = {
    error: 0,
    warn: 1,
    http: 2,
    commands: 3,
    events: 3,
    utils: 3,
    info: 4,
    verbose: 5,
    debug: 6,
    silly: 7
};

const dateFormat = () => {
    return dtFormat.format(new Date());
};

export default class LoggerService {
    constructor(route, enableFileLogs = true, logFilterLevel = undefined) {
        let alignColorsAndTime = winston.format.combine(
            winston.format.printf((info) => {
                const level = info.level.toUpperCase();
                const date = dateFormat();
                let metaData = undefined;
                if (!!info?.meta) {
                    if (typeof info.meta === "string" || typeof info.meta === "number") {
                        metaData = info.meta;
                    } else {
                        metaData = Object.assign({}, info.meta);
                        metaData = JSON.stringify(metaData);
                    }
                }
                let message = `${COLOUR_MAP[info.level]}${date} ${COLOURS.WHITE}| ${
                    COLOUR_MAP[info.level]
                }${level} ${COLOURS.WHITE}| ${COLOUR_MAP[info.level]}${route} ${COLOURS.WHITE} \n ${
                    COLOUR_MAP[info.level]
                }${level} MESSAGE: ${COLOURS.WHITE}${info.message} `;
                message = metaData ? message + `| ${COLOURS.WHITE}${metaData}` : message;
                return message;
            })
        );

        let prettyPrintMyLogs = winston.format.combine(
            winston.format.printf((info) => {
                const level = info.level.toUpperCase();
                const date = dateFormat();
                let metaData = undefined;
                if (!!info?.meta) {
                    if (typeof info.meta === "string" || typeof info.meta === "number") {
                        metaData = info.meta;
                    } else {
                        metaData = Object.assign({}, info.meta);
                        metaData = JSON.stringify(metaData);
                    }
                }
                let message = `${date} | ${level} | ${route} \n ${level} MESSAGE: ${info.message} `;
                message = metaData ? message + `: ${metaData} ` : message;
                return message;
            })
        );

        this.logger = winston.createLogger({
            levels: LEVELS,
            transports: [
                new winston.transports.Console({
                    level: logFilterLevel,
                    format: alignColorsAndTime
                }),
                ...(enableFileLogs
                    ? [
                        new winston.transports.File({
                            level: logFilterLevel,
                            format: prettyPrintMyLogs,
                            filename: join(appDaemonConfig.configDirectory, `logs/${route}.log`),
                            maxsize: 5242880,
                            maxFiles: 3
                        })
                    ]
                    : [])
            ]
        });
    }

    info(message, meta) {
        this.logger.log("info", message, {
            meta
        });
    }

    warning(message, meta) {
        this.logger.log("warn", message, {
            meta
        });
    }

    commands(message, meta) {
        this.logger.log("commands", message, {
            meta
        });
    }

    events(message, meta) {
        this.logger.log("events", message, {
            meta
        });
    }

    utils(message, meta) {
        this.logger.log("utils", message, {
            meta
        });
    }

    error(message, meta) {
        this.logger.log("error", message, { meta });
    }
}
