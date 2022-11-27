import { ToadScheduler, SimpleIntervalJob, AsyncTask, Task } from 'toad-scheduler';

export default class TaskManager {
    #tasksManager;
    constructor () {
        this.#tasksManager = new ToadScheduler();
    }

    #getTask(taskId, func){
        return () => {
            func();
        }
    }

    addInterval (taskId, seconds, func, runImmediately = false){
        if(!this.getSafeTasksById(taskId)){
            const newTask = new Task(taskId, this.#getTask(taskId, func))
            const newInterval = new SimpleIntervalJob({seconds: seconds, runImmediately: false}, newTask, {id: taskId, preventOverrun: true})
            this.#tasksManager.addSimpleIntervalJob(newInterval)
            console.log(this.#tasksManager)
        }
    }

    #getSelfDestroyingTask(taskId, seconds, func){
        return ( ) => {
            setTimeout(async () => {
                // Job may have been destroyed, prevent from running it...
                try{
                    this.#tasksManager.getById(taskId)
                    const response = await func()
                    this.stopAndDestroyTask(taskId);
                    return response;
                }catch(e){
                    return;
                }

            }, seconds * 1000)
        }
    }

    addTimeout (taskId, seconds, func){
        //Always add task, or recreate task with a fresh interval...
        this.stopAndDestroyTask(taskId)
        const newTask = new Task(taskId, this.#getSelfDestroyingTask(taskId, seconds, func))
        const newInterval = new SimpleIntervalJob({seconds: seconds, runImmediately: true}, newTask, {id: taskId, preventOverrun: true})
        this.#tasksManager.addSimpleIntervalJob(newInterval)
    }

    getSafeTasksById(taskId){
        try{
            this.#tasksManager.getById(taskId)
        }catch (e){
            // console.log(e)
            return false
        }
    }

    stopAndDestroyTask(taskId){
        this.#tasksManager.removeById(taskId);
    }
}