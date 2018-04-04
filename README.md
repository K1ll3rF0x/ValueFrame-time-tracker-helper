## ValueFrame Timetracker Helper

This is a user script for [Tampermonkey](http://tampermonkey.net/) and [Greasemonkey](https://www.greasespot.net/).

The motivation of this project is to ease time tracking for people who have to log many little tasks in [ValueFrame](https://psa.visma.fi/valueframe/) 
during a work day.

## Install (TamperMonkey / Chrome)

1. Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) plugin for.
1. Navigate to [https://github.com/K1ll3rF0x/ValueFrame-time-tracker-helper/raw/master/vallu-helper.user.js](https://github.com/K1ll3rF0x/ValueFrame-time-tracker-helper/raw/master/vallu-helper.user.js)
    -> Tampermonkey script install page should open.
1. Install script


## Usage

By navigating to url such as: https://guidance.solita.fi/tunnit/tunnit.cgi?henkilo=&tehtavaid=12345&tyonumero=1234&selite=job%20description&aika=0.5
your task is filled in and saved automatically.

The description of the task is provided via "selite" url parameter and the time spent for the task is provided via "aika" url parameter (in hours).

Additionally, you can provide "disableSave=true" url parameter to disable automatic saving.

Url parameters "tyonumero" and "tehtavaid" are for ValueFrame only.
Param "tyonumero" identifies a subproject in ValueFrame and param "tehtavaid" defines a specific task of a subproject.