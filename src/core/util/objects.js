export const createServiceDataObject = (entity_id, additionalData) => {
    return {
        entity_id,
        ...additionalData
    }
}