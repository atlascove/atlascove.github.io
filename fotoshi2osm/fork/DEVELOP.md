# Develop

This application is based on web technologies, and mainly written in ECMAScript 6 (modern JavaScript). This documentation is for people who want to build by themselves or develop the project. If you just want to install it somewhere, you can download one of the [recent builds](https://pic4review.pavie.info/builds/), and put it on your FTP server.


## Dependencies

You need to install the given tools before starting:
* Node Package Manager (NPM) - [Documentation](https://docs.npmjs.com/getting-started/what-is-npm)
* Transifex CLI - [Documentation](https://docs.transifex.com/client/installing-the-client)


## Build your own

To build and deploy your own instance, run the following commands:
```sh
npm install # Retrieve dependencies
npm run build # Test and compile
```

Then, if everything went well, you have now a `build/` folder and `Pic4Review_latest.zip` which are ready to deploy on any web server.


## Develop locally

You can also run a develop web server for testing purposes. To do so, run these commands:
```sh
npm run start
```

If no errors appears, a web server at `http://localhost:3000` is ready to browse.


## Configuration

Depending of your goals, you might be interested in changing some general configurations. This is optional, Pic4Review can run as is directly. These can be found in `src/app/constants.js`, and mainly concerns URL for accessing various third-party websites or data. As Pic4Review also communicates directly with [OpenStreetMap API](https://wiki.openstreetmap.org/wiki/API_v0.6) (in particular for integrated editing), it needs OAuth tokens to have access to push data against OSM servers. So you might need to change the tokens to use yours, [more information here for how to do so](https://wiki.openstreetmap.org/wiki/OAuth).


## Documentation

This project has a maintained documentation for its JS classes and methods. You can [read it online here](https://pic4review.pavie.info/doc/) (for latest stable version), or locally by generating it (for latest develop version):
```sh
npm run doc
```

Then, it will be available in `doc/` folder. If you are developing new features for this project, we highly recommend you to write appropriate documentation. We follow the [JSDoc](http://usejsdoc.org/about-getting-started.html) documentation format, and make use of [documentation.js](http://documentation.js.org/) for generating it.


## Pull requests

As this project is open source, pull requests are welcome. If you want to improve project, or add a new tool, please create a new branch based on __develop__ (not master).


## Additional information

### Locales

Various text labels are present on view components. To make the application understandable in several languages, we use locales files, which allow to translate those labels. Locales are managed using Transifex. You can see [the project here](https://www.transifex.com/openlevelup/pic4review/).

To manage locales locally, you can use these commands:
```sh
npm run i18n:download       # Retrieve locales from Transifex, having > 75% of translated labels
npm run i18n:build          # Regenerate en locale file when labels have been added in code
npm run i18n:upload         # Upload en locale file to Transifex (to do when file has been regenerated)
npm run i18n:status         # Show current status of locales files
```

To add a new locale (which has never been integrated before), please do the following:
* Retrieve locale file with `npm run i18n:download`
* Edit `src/app/app.js`, add the locale code (like _fr_ or _fr-FR_) in the `LOCALES` array (near the top of the file)
* Check that the locale is working as expected by running `npm run start` and changing your browser locale
