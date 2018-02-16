#!/usr/bin/env node
const program = require("yargs");

program.command(["how [os]", "howto [os]"], "Checks how to jailbreak a version.", {}, checkJailbreak);
program.command("exists [os]", "Checks if a version is jailbreakable.", {}, checkIfJailbreakable);
program.help();
program.argv;

function checkJailbreak(args) {
    console.log(args);
};
function checkIfJailbreakable(args) {
    console.log(args);
};