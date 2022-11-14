const config = {
  appDaemon: {
    haUrl: "localhost",
    haKey: "",
    encryption: false,
    port: 8123
  },
  apps: {
    helloWorld: {
      enable: true //enable to log "hello world" to the stdout
    },
    printEntities: {
      enable: false //enable to log entities to the stdout
    },
    energySaver: {
      enable: false,
      entities: ["light.some_light"], //array of entities to listen for
      minutes: 60 //how many minutes until shutting them off
    }
  },
};

module.exports.default = config;
