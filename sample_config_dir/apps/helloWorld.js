export const app = appDaemon => {
  const { config, utils, listeners } = appDaemon;
  const { entities, settings } = config
  console.log("Hello World!");
  console.log("Applications get access to a personal config object:", "\nEntities: ", entities, "\nSettings: ", settings)
  console.log("You can also check out the utility object:", utils)
  console.log("You can also check out the listeners object:", listeners)
  const onEvent = evt => {
    if (
        evt.event_type === "state_changed" &&
        // evt.data.new_state.state === "on" &&
        entities.indexOf(evt.data.entity_id) > -1
    ) {
      console.log(evt.data.old_state.attributes)
    }
  }
  listeners.subscribeToEvent(onEvent)
};
