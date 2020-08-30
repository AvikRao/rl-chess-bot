const Discord = require("discord.js");
const auth = require("./auth.json");
const readline = require("readline");

const prefix = "!";

const client = new Discord.Client();
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

client.login(auth.BOT_TOKEN);

rl.on('line', (input) => {
	client.channels.cache.get("749700627277545543").send(input);
});
