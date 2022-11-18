export const delay_seconds = (delay) => {
    return new Promise(resolve => setTimeout(resolve, delay * 1000));
}