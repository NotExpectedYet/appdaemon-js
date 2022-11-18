export const createEntityTargetObject = (entity_id) => {
    return {
        entity_id,
    }
}
export const createServiceDataObject = (additionalData) => {
    return {
        variables: additionalData
    }
}