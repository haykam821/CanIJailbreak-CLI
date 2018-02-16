#!/usr/bin/env node

(async function() {
    const program = require("yargs");
    const semver = require("semver");
    const request = require("request-promise");
    const stripTags = require("striptags");
    const fixVersion = require("normalize-version");

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
            return semver.satisfies(args.os, `${fixVersion(value.ios.start, 3)} - ${fixVersion(value.ios.end, 3)}`) && value.jailbroken
        });

        for (let item of matches) {
            let formatted = [];

            formatted.push(`Name: ${item.name} (${item.url})`);
            formatted.push(`Supported Versions: ${fixVersion(item.ios.start, 3)} — ${fixVersion(item.ios.end, 3)}`);

            formatted.push(`Platforms: ${item.platforms.join()}`);

            formatted.push(`*${stripTags(item.caveats)}`);

            console.log(formatted.join("\n"));
        }
    };
    async function checkIfJailbreakable(args) {
        console.log(args);
    };
})();