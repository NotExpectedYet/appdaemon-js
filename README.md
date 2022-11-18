AppDaemon JS
------

### Javascript apps for Home Assistant
App Daemon JS is an attempt to allow me to extend my home assistant installation with JavaScript rather than Python. 

This is a WIP for myself currently. If anyone else wants to use it feel free, I'll put up a repository with how I'm using it soon. 

It's not to be considered robust at all though. If anyone would like to help take this further then feel free, could be an interesting little project.


_________

**Try it out:**

Run the following on a machine with NodeJS and npm installed:

`npm ci`

then run

`npm run build`

then

`node lib/core/app.js`

you should see some sample config and a sample app put 
in your home directory under `.appdaemon-js/`

that's the default config directory, 
you can also specify a different directory via

`appdaemon-js ~/.path/to/config/directory/`

_________

**Development:**

Install the npm package dependencies

`npm ci`

then run

`npm run dev`

a default config file will be generated on first run. Fill in your HA details and run the app again.