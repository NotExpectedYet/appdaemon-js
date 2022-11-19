export const someItems = (array, key, match) => {
    return array.some(item => item[key] === match)
}
export const everyItem = (array, key, match) => {
    return array.every(item => item[key] === match)
}