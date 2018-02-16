#!/usr/bin/env node

(async function() {
    const program = require("yargs");
    const semver = require("semver");
    const request = require("request-promise");

    const output = await request({
        method: 'GET',
        url: 'https://canijailbreak.com/jailbreaks.json',
        json: true
    });

    program.command(["how [os]", "howto [os]"], "Checks how to jailbreak a version.", {}, checkJailbreak);
    program.command("exists [os]", "Checks if a version is jailbreakable.", {}, checkIfJailbreakable);
    program.help();
    program.argv;

    async function checkJailbreak(args) {
        const matches = output.jailbreaks.filter(function (value) {
            return semver.satisfies(args.os, `${value.ios.start} - ${value.ios.end}`)
        });
    };
    async function checkIfJailbreakable(args) {
        console.log(args);
    };
})();