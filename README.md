AppDaemon JS
------

### Javascript apps for Home Assistant
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

