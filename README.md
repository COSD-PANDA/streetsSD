# SDStreets

## About
StreetsSD is a simple front-end visualization tool for displaying work completed.

## Contributing Code / Feature Requests / Bug Reports
Please review the [contributing guidelines](https://github.com/cityofsandiego/streetsSD/blob/master/contributing.md)

## Getting Started
### Requirements
* Ruby (you can use [rvm](https://rvm.io/) to install)
* Node
* CartoDB (since you won't have access to the CartoDB map to get this working, you will simply just need to repicate it and change the key);

### Running.
* Clone the repo
* `bundle install`
* `npm install`
* `gulp` to begin watching and compiling.

### Languages
The application is supported by several languages.  They are here in no particular order:
* Javascript
* Ruby
* SCSS
* CSS
* HTML

### Frameworks / Libraries / Tools
The application is designed to use Jekyll for partials and templating.  It's using Gulp for controlling the build.  For more information about this setup please see the [Jekyllized README](https://github.com/MrMaksimize/generator-jekyllized/blob/master/README.md).

The backend of the application is mainly CartoDB.  As various JS events happen, a query is constructed and sent off to CartoDB as an api, and then the response is displayed.

[C3](http://c3js.org/) is used for charting, and [Squel.js](https://hiddentao.github.io/squel/) for constructing queries to send to CartoDB.

Static assets are hosted on S3 as needed.

The hosting for staging is handled by Surge, and production runs on Github Pages.

Analytics are supported by Google Tag Manager, Google Analytics and HotJar.

Deployment is supported by CircleCI.


