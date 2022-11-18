import { resolve } from "path"
const returnArgumentsAsArray = () => {
    return process.argv.slice(2);
}

export const returnCliPathArgument = () => {
    if(!returnArgumentsAsArray()[0]){
        console.log("NO ARG")
        return
    }
    return resolve("./", returnArgumentsAsArray()[0])
}
