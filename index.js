const Discord = require("discord.js");
const auth = require("./auth.json");
const readline = require("readline");
const { Chess } = require('chess.js');
require('typescript-require');

var Stockfish = require("stockfish-native");
var PATH_TO_STOCKFISH = "/home/pi/rl-chess-bot/stockfish-11-linux/src/stockfish";

const prefix = "!";
var embed;
var game;

// /home/pi/rl-chess-bot/stockfish-11-linux/src/stockfish

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

var currentPlayer;

client.login(auth.BOT_TOKEN);

rl.on('line', (input) => {
    client.channels.cache.get("704419428179378238").send(input);
});

client.on("message", async (message) => {
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

    if (command === "game") {

        if (args.length < 2) {

            message.reply(
                embed.setTitle("Missing Arguments")
                .addField("Syntax", "!game [difficulty] [color]")
                .addField("Difficulty", "**0:** Well-Trained Monkey | **1:** Beginner | **2:** Intermediate | **3:** Advanced")
                .addField("Color", "White | Black | Random")
                );
            return;

        } else if (![0, 1, 2, 3].includes(parseInt(args[0])) || !['white', 'black', 'random'].includes(args[1].toString().toLowerCase())) {

            message.reply(
                embed.setTitle("Invalid Arguments")
                .addField("Syntax", "!game [difficulty] [color]")
                .addField("Difficulty", "**0:** Well-Trained Monkey | **1:** Beginner | **2:** Intermediate | **3:** Advanced")
                .addField("Color", "White | Black | Random")
                );
            return;

        }

        game = new Chess();
        currentPlayer = message.author;

        let color = args[1].toLowerCase();

        if (color == 'random') {
            color = ['white', 'black'][Math.floor(Math.random() * 2)];
        }

        if (color == "white") {
            game.header('White', currentPlayer.username, 'Black', 'RL Chess Bot (StockFish 11)');
        } else if (color == "black") {
            game.header('White', 'RL Chess Bot (StockFish 11)', 'Black', currentPlayer.username);

        }

        message.reply("New game started!");
    }

    if (command === "move" && message.author == currentPlayer) {

        if (args.length < 1) {
            message.reply("You need to choose a move!");
            return;
        }

        let move = args[0];
        if (!game.moves().includes(move)) {
            message.reply("That move is either invalid or illegal.");
            return;
        }

        game.move(move, {sloppy: true});
    }



});
