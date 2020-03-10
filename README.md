# Openhab UI
A smart and lean UI for your OpenHab Server (locally) using OpenHab REST API.

## Repo
GitHub Repo
https://github.com/jh1777/OpenHabUI

## Ideas
Use 'Labels' from Clarity!


# Setup
## OpenHab
add the line `org.eclipse.smarthome.cors:enable=true` in the file *services/runtime.cfg*

## Run locally
1. Install angular cli
2. cloe git repo (`git clone ....`)
3. run `npm i` in cloned folder
4. start app using `ng serve`

## Config
The config.json is the main configuration of this UI.
The OpenHab API URL must be configured as like `http://localhost:8080/rest`. Or whatever your host is.
> Don't forget to setup OpenHab like described above Setup -> OpenHab section.
Any `category` (like contact, temperature, motion etc.) is a fixed term for this application.
File is separated into `groups` for categories, like mentioned above and a section for defining the `rooms`.
`rooms.group` must be the openhab group name for the room you awant to see in the UI.
Inside of that room every item that belongs to that group will be splitted into the `groups` by category.
My example can be found and used as reference.
More detailled description of that file will follow!

# Angular Default Help

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.4.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

# Reference
## Useful Tutorial for Clarity
https://medium.com/@beeman/tutorial-project-clarity-and-angular-cli-50d845a24d5b

## CShap Linq vs Typescript 
https://decembersoft.com/posts/typescript-vs-csharp-linq/

## Clarity
https://clarity.design/documentation