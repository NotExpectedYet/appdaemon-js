AppDaemon JS
------

### Javascript apps for Home Assistant
App Daemon JS is an attempt to allow me to extend my home assistant installation with JavaScript rather than Python. 

Currently considered unstable... use at your own risk.

Path to V1.0 is below...

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

_________
This list is not exhaustive, it may change as I work through creating what I want out of this. 

**Path to v1.0:**
- [ ] Better configuration validation / updating
- [ ] Create proper utility class to handle home assistant data communication
- [ ] Create helper utilities to further extend custom app functionality
- [ ] Create listener classes for events
- [ ] Create some better example applications
- [ ] Simple webserver for logs
- [ ] Update documentation with example applications and setup
- [ ] Github actions for builds / releasing
- [ ] Docker version
- [ ] Compile application down to binary