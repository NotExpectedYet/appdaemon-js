import { isFuture } from 'date-fns'

export const dateInTheFuture = (date) =>{
    return isFuture(date)
}