# Openhab UI

A smart and lean UI for your OpenHab Server (locally) using OpenHab REST API.

## Repo

GitHub Repo
https://github.com/jh1777/OpenHabUI

## Supported Browsers

- Safari >= 13
- Chrome >= 80

## Setup

### OpenHab

add the line `org.eclipse.smarthome.cors:enable=true` in the file *services/runtime.cfg*

### Run locally in dev mode

1. Install angular cli (`npm install -g @angular/cli`)
2. clone this git repo (`git clone https://github.com/jh1777/OpenHabUI.git`)
3. run `npm i` in cloned folder
4. start app using `ng serve` or use provided script `start-on-server.sh` (takes care of host and customizes port to 4222)



## Components

### Dashboard

The dashboard is the main entrypoint when the UI is started

## How to configure

#### The `config.json` file is the main configuration of this App!

#### URL

`openHabUrl`key is used to set the OpenHAB API URL.

The **OpenHab API URL** must be configured like `http://localhost:8080/rest` (for example). Please adapt according to your hostname and port.
> Don't forget to setup OpenHab like described above in Setup -> OpenHab section.
>
> 

#### Sections

There are three main sections in `config.json`.

##### dashboardTiles

This section contains all _tile_ definitions for the dashboard. Each tile itself has a _title_ and some _items_ in it. You can define each item like you want it to be. 

Each single _item_ is defined as:

```json
{
    "name": "<openhab item name>",
    "displayName": "<label in UI>",
    "category": "<category - see below>",
    "unit": "<item unit like °C, % etc.>", // optional
    "warningThreshold": 25, // optional: if set, state will be compared and set to isWarning
    "warningThresholdType": "gt", // optional: if warningThreshold is set, this should be also set to 'gt' (greater than) or 'lt' (lower than) to be able to determine warning state
  	"showInSummary": true,  // optional: If you want to include this item in the summary bar (default is false)
  	"showOnlyInSummary": false  // optional: If you want to include this item ONLY in the summary bar and don't show in a tile (default is false)
}
```
##### rooms
Define `groupName` and `displayName` of groups you want to see on a separate page in the UI. 
One page for each room will be shown.

##### categories
tbd

#### Category
These are static categories defined for the UI itself since not every openhab item is configured the same and reporting the same via rest api.
Defined categories are found in enum _CategoryType_ `src/app/models/config/category.ts`.

My `config.json` is included and can be used as reference.
More detailled description of that file will follow!

## Angular Default Help

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.4.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Reference

### Useful Tutorial for Clarity

https://medium.com/@beeman/tutorial-project-clarity-and-angular-cli-50d845a24d5b

### CShap Linq vs Typescript

https://decembersoft.com/posts/typescript-vs-csharp-linq/

### Clarity

https://clarity.design/documentation
