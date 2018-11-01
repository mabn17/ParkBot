/*
* Functions for ParkBot - Server
*/
"use strict";
const fs = require('fs');
const registerFile = fs.readFileSync('../register.json');
var register = JSON.parse(registerFile);

/**
 * Wrapper function for sending a JSON response
 *
 * @param  Object        res     The response
 * @param  Object/String content What should be written to the response
 * @param  Integer       code    HTTP status code
 */
function sendJSONResponse(res, content, code) {
    code = code || 200;
    res.writeHead(code, {'Content-Type': 'application/json; charset=utf8'});
    res.write(JSON.stringify(content, null, "    "));
    if (jf.dev) {
        console.log(res);
    }
    res.end();
}

/**
 * Wrapper function for a bad response
 *
 * @param {Object}        res     The response
 * @param {Object/String} content What should be written to the response
 * @param {Integer}       code    HTTP status code
 */
function badResonse(res, content, code) {
    code = code || 500;
    content = content || "500 Internal Server Error";
    res.writeHead(code, "Content-Type: text/plain");
    res.write(content);
    res.end();
}

/**
 * Cleans up the given JSON object.
 * Function removes entrys where the Day:road is null
 *                  aswell as where road has the same value as Day
 *
 * @param {Object} obj The Json object (register)
 *
 * @return {List} r  Cleaned version of obj
 */
function cleanRegister(obj) {
    let r = obj;

    for (let i = 0; i < r.length; i++) {
        for (let key in r[i]) {
            const current = r[i][key];
            if (current == null || current == key) {
                delete r[i];
            }
            break;
        }
    }

    r = r.filter(function(value) {
        return value !== null;
    });

    return r;
}

/**
 * Cleans up the given JSON object.
 * Uses cleanRegister to clean up the object then returns
 *         a list of objects that gets affected in the next 24h
 *
 * @param {Object} obj The Json object (register)
 *
 * @return {List} r  Current version of obj
 */
function cleanCurrent(register) {
    let day, hour, dayList, r;
    let placeHolder = [];

    r = cleanRegister(register);
    day = new Date().getDay();
    hour = new Date().getHours();
    dayList = [
        "Söndag", "Måndag", "Tisdag",
        "Onsdag", "Torsdag", "Fredag", "Lördag"
    ];

    for (let i = 0; i < r.length; i++) {
        for (let key in r[i]) {
            
            // Key example: "Måndag 9-12"
            // timeFrame after filter [9, 12]
            let timeFrame = key.split(" ")[1].split("-");

            // Checks the valid entrys for the current day
            let todayCompareOne = (key.indexOf(dayList[day]) > -1);
            let todayCompareTwo = (parseInt(timeFrame[0]) <= parseInt(hour))
            let todayCompareThree = (parseInt(timeFrame[1]) >= parseInt(hour));
            let compareFirst = (todayCompareOne && todayCompareTwo && todayCompareThree);

            // Checks the entrys for tomorrows day (24h period)
            let todayCompareFour = (key.indexOf(dayList[day + 1]) > -1);
            let todayCompareFive = (parseInt(timeFrame[1]) <= parseInt(hour));
            let compareSecound = (todayCompareFour && todayCompareFive);

            if (compareFirst || compareSecound) {
                placeHolder.push(r[i]);
            }
            break;
        }
    }

    return placeHolder;
}

function cleanKeys(register) {
    let r = cleanCurrent(register);
    let placeHolder = [];

    for (let i = 0; i < r.length; i++) {
        let t = {};
        let counter = 0;
        for (let key in r[i]) {
            t[counter] = r[i][key];
            counter += 1;
        }
        counter = 0;
        placeHolder.push(t);
    }
   
    return placeHolder;
}
// Returning object (One per route)
let jf = {};

/**
 * Writes out a JSON response for /show/register
 * Displays the whole JSON file
 * Removes values where the "Day" ex. Måndag 9-13 == null
 *                          and where the "Day" == Day
 *
 * @param  {Object}        res     The response
 */
jf.showRegister = (res) => {
    let r = cleanRegister(register);

    try {
        sendJSONResponse(res, r);
    } catch (e) {
        console.log(e);
        badResonse(res);
    }
};

/**
 * Writes out a JSON response for /get/current
 *          for the current day and time.
 * Displays the whole JSON file
 * Removes values where the "Day" ex. Måndag 9-13 == null
 *                          and where the "Day" == Day
 *
 * @param  {Object}        res     The response
 */
jf.getCurrent = (res) => {

    let r = cleanCurrent(register);

    try {
        sendJSONResponse(res, r);
    } catch (e) {
        console.log(e);
        badResonse(res);
    }
};

/**
 * Does the samething as getCurrent tho it changes the key names 
 *                                      to numbers between 0-3
 *
 * @param  {Object}        res     The response 
 */
jf.getCleanedCurrent = (res) => {

    let r = cleanKeys(register);

    try {
        sendJSONResponse(res, r);
    } catch (e) {
        console.log(e);
        badResonse(res);
    }
};

jf.searchStreet = (res, street) => {
    let r = cleanKeys(register);
    let placeHolder = [];
    let lowerCaseStreet = decodeURIComponent(street);

    lowerCaseStreet = lowerCaseStreet.toLowerCase();

    console.log(lowerCaseStreet);

    for (let i = 0; i < r.length; i++) {
        const current = r[i];

        if ((current[0] !== null) && (current[2] !== null)) {
            const currentStreet = current[0].toLowerCase();
            const currentBetween = current[2].toLowerCase();

            if ((currentStreet.indexOf(lowerCaseStreet) !== -1) || (currentBetween.indexOf(lowerCaseStreet) !== -1)) {
                placeHolder.push(current);
            }   
        }
    }

    // Clears the list from duplicates
    placeHolder = placeHolder.filter((ele, index, self) => {
        return index == self.indexOf(ele);
    });

    try {
        sendJSONResponse(res, placeHolder);
    } catch (e) {
        console.log(e);
        badResonse(res);
    }
};

module.exports = jf;
