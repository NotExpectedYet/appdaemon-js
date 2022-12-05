export const createEntityTargetObject = (entity_id) => {
    return {
        entity_id,
    }
}
export const createScriptDataObject = (additionalData) => {
    return {
        variables: additionalData
    }
}

export const createServiceDataObject = (additionalData) => {
    return additionalData
}

export const breakOutNewOldStates = (evt) => {
    const { new_state, old_state } = evt
    const new_state_text = new_state?.state
    const old_state_text = old_state?.state
    return {
        new_state: new_state_text,
        old_state: old_state_text
    }
}