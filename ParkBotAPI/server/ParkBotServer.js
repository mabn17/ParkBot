/**
 * Front for ParkBot - Karlskrona
 */
"use strict";

// A better router to create a handler for all routes
var Router = require("./router.js");
var jf = require("./functions.js");
var fs = require("fs");
var router = new Router();

// Import the http server as base
var http = require("http");
var url = require("url");

/**
 * Display a helptext about the API.
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/", (req, res) => {
    res.writeHead(200, "Content-Type: text/plain");
    res.write("Welcome the ParkBot server. This is the API of what can be done.\n\n" +
        " /                 Display this helptext.\n\n" +
        " /show/register    Shows the whole register\n\n" +
        " /get/current      Displays the register dippending on the day and time. \n\n" +
        " /get/current \n" +
        "     /cleaned      Changes the KEY values from get/current to numbers. \n\n"
    );
    res.end();
});

/**
 * Shows the APIs JSON file
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/show/register", (req, res) => {
    jf.showRegister(res);
});

router.get("/get/current", (req, res) => {
    jf.getCurrent(res);
});

router.get("/get/current/cleaned", (req, res) => {
    jf.getCleanedCurrent(res);
});

/**
 * Create and export the server
 */
var server = http.createServer((req, res) => {
    var ipAddress,
        route;

    // Log incoming requests
    ipAddress = req.connection.remoteAddress;

    // Check what route is requested
    route = url.parse(req.url).pathname;
    console.log("Incoming route " + route + " from ip " + ipAddress);

    // var the router take care of all requests
    router.route(req, res);
});

// export default server;
module.exports = server;
