export default class MemoryStoreModule{
    #memory = {}

    constructor(){}

    value(key){
        return this.#memory[key]
    }

    memory(){
        return this.#memory
    }

    storeValue(key, value){
        this.#memory[key] = value
    }

    collectValues(key, value, maxLength){
        console.log(this.#memory)
        console.log(!this.#memory[key])
        if(!this.#memory[key]){
            this.#memory[key] = [];
        }
        console.log("MOEMORY", this.#memory[key])
        this.#memory[key].push(value)

        if(this.#memory[key].length >= maxLength){
            this.#memory[key].shift();
        }
    }

    delete(){
        delete this.#memory[key]
    }
}