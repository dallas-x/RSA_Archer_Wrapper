# Wrapper for RSA GRC Tool

This tool is used to Automate KPI's (Key Performance Indicators) and alert creation in RSA's Archer GRC platform. This tool is useful for data sources that are not directly connected to Archer. This allows you to upload a zip file containing CSV files with Security Related Data. Although customizing will allow for other types of files or data.

## Getting Started

Pull the repository to a local development machine and perform a ```npm install``` After all packagages are successfully installed you need to create and configure a ```.env``` file at the root of the project. You can use the command ```touch .env``` Run the application using ```npm start``` this will create the databases needed for the application. Test logging in into your archer instance. First time Archer users will need to login to Archer before using this tool.



### Prerequisites

* Windows, OSX, or Linux
* [NODE.JS](https://nodejs.org) - Latest Version 
* [Powershell](https://github.com/PowerShell/PowerShell/releases/) - Version 6 Open Source 

### Installing

A step by step series of examples that tell you how to get a development env running

Install packages

```
npm install
```

Create .env file and configure it

```
touch .env
```

#### .env includes
* base_url = "https://location/of/archer/instance/RSAarcher"
* instance_name = "Default" // Name of archer instance
* user_domain = "" // Leave blank unless you have one
* secret = "Unicorn" //used for session
* PORT = 3000 // Desired port

```src/js/dbfunc.js``` contains db schema and other major functions for db manipulation. Edit this as needed for your data.

```src/js/ticketCreator.js``` contains functions for creating INC & Alert objects to be pushed to Archer.

```src/js/webServices.js``` contains functions for searching archer for previous alerts or incidents.  

```scripts/generator(MAC).ps1``` contains the script filter and clean the data uploaded. output is csv file.

### coding style

Airbnb linting rules

## Built With

* [NODE.JS](https://nodejs.org) - JS Runtime env
* [Powershell](https://github.com/PowerShell/PowerShell/releases/) - Scripting Language
* [Express](https://expressjs.com) - Web app framework
* [Passport](http://www.passportjs.org) - Authentication for NODEJS

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

* **Dallas Baker** - *Creator* - [followthekoden](https://github.com/followthekoden)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## More information

[RSA Community](https://community.rsa.com/docs/DOC-45643)
