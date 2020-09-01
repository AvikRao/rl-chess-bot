const Discord = require("discord.js");
const auth = require("./auth.json");
const readline = require("readline");

const prefix = "!";

const client = new Discord.Client();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Reset embed fields
function embedReset () {
    embed = new Discord.MessageEmbed()
    .setColor("#9400D3");
}

client.login(auth.BOT_TOKEN);

rl.on('line', (input) => {
    client.channels.cache.get("704419428179378238").send(input);
});

client.on("message", (message) => {
    embedReset();
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(" ");
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
            message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }
});
