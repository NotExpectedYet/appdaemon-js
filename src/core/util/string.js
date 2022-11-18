export const getDomainFromEntityID = (entity_id) => {
    const split = entity_id.split(".");
    return split[0];
}
export const getEntityFromEntityID = (entity_id) => {
    const split = entity_id.split(".");
    return split[1];
}