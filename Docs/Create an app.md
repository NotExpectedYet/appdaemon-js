#Creating an AppDaemon-JS app

An appdaemon-js app can be as simple as 


```javascript
// export the app as exports.app
module.exports.app = appDaemon => {
  
  /* get the utilities from the appDaemon that 
   * got passed in
   */
  
  let { connection, util, config } = appDaemon;
  
  /* create a function to handle events, in this case
   * we are subscribing to all of the entities using
   * the subscribeEntities function and we will create
   * a function to log the entities to the console
   */
  
  const onEntities = entities => console.log("New entities!", entities);
  
  /* finally, subscribe to entities
   */
  
  util.subscribeEntities(connection, onEntities);
  
}
```
