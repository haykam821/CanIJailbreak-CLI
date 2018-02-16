#!/usr/bin/env node

const asyncRequire = require("async-require");

(async function() {
    const program = await asyncRequire("yargs");
    const semver = await asyncRequire("semver");
    const request = await asyncRequire("request-promise");
    const stripTags = await asyncRequire("striptags");
    const fixVersion = await asyncRequire("normalize-version");
    const chalk = await asyncRequire("chalk");

    const platformFromAPI = {
        "Windows": "win32",
        "macOS": "darwin",
        "Linux": "linux"
    };
    const apiFromPlatform = {
        "win32": "Windows",
        "darwin": "macOS",
        "linux": "Linux"
    };

    program.command("info [os]", "Checks how to jailbreak a version.", {
        "simple": {
            description: "Hides tool version and merges URL with name.",
            alias: ["s"],
            type: "boolean",
            default: false
        },
        "first": {
            description: "Gets only the first matching result.",
            alias: ["f"],
            type: "boolean",
            default: false
        }
    }, checkJailbreak);
    program.command("exists [os]", "Checks if a version is jailbreakable.", {}, checkIfJailbreakable);

    program.options({
        "compat": {
            description: "Ignore jailbreaks that don't support the current OS.",
            alias: ["c", "compatible"],
            type: "boolean",
            default: true
        },
        "url": {
            description: "The URL to get the jailbreak information from.",
            type: "string",
            default: "https://canijailbreak.com/jailbreaks.json"
        }
    });

    program.help();
    program.argv;

    async function checkJailbreak(args) {
        const matches = await getMatches(args);

        matches.length = args.first ? 1 : matches.length;

        console.log("");

        for (let item of matches) {
            let formatted = [];
            let colorPlatforms = [];

            for (let platform of item.platforms) {
                if (platformFromAPI[platform] === process.platform || platform === "iOS") {
                    colorPlatforms.push(chalk.greenBright(platform));
                } else {
                    colorPlatforms.push(chalk.redBright(platform));
                }
            }
            let versions = chalk.whiteBright(`${fixVersion(item.ios.start, 3)} — ${fixVersion(item.ios.end, 3)}`);
            let platforms = colorPlatforms.join(chalk.whiteBright(", "));
            let url = !args.simple || !item.url ? "" : chalk.whiteBright(` (${chalk.blueBright.underline(item.url)})`);

            formatted.push(chalk.gray("Name: ") + chalk.whiteBright(item.name) + url);

            if (item.version && !args.simple) {
                formatted.push(chalk.gray("Version: ") + chalk.whiteBright(item.version));
            }
            if (item.url && !args.simple) {
                formatted.push(chalk.gray("URL: ") + chalk.blueBright.underline(item.url));
            }

            formatted.push(chalk.gray("Supported Versions: ") + versions);
            formatted.push(chalk.gray("Platforms: ") + platforms);

            if (item.caveats && !args.simple) {
                formatted.push(chalk.yellow(`* ${stripTags(item.caveats)}`));
            }

            formatted.push("");

            console.log(formatted.join("\n"));
        }
    };
    async function checkIfJailbreakable(args) {
        const matches = await getMatches(args);
        console.log(matches.length > 0);
    };

    async function getMatches(args) {
        const ios = fixVersion(args.os, 3);

        const output = await request({
            method: 'GET',
            url: args.url,
            json: true
        });

        const matches = output.jailbreaks.filter(function (value) {
            let satisfies = semver.satisfies(ios, `${fixVersion(value.ios.start, 3)} - ${fixVersion(value.ios.end, 3)}`);
            let compatible = args.compat ? value.platforms.includes(apiFromPlatform[process.platform]) || value.platforms.includes("iOS") : true;

            return satisfies && compatible && value.jailbroken;
        });

        return matches;
    }
})();