const Discord = require("discord.js");
const auth = require("./auth.json");
const readline = require("readline");
const jsChess = require('js-chess-engine');

const prefix = "!";
var embed;
var game;
var level;

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
        }
        game = new jsChess.Game();
        currentPlayer = message.author;
        level = args[0];
        console.log(game.moves());
    }

    if (command === "move" && message.author == currentPlayer) {
        if (args.length < 1) return;
        let board = game.exportJson();
        let move = args[0].replace(/x|\+|/gi, '');
        let piece = move.slice(0, 1);
        let dest = move.slice(-2).toUpperCase();
        let start = '';
        let pawn = '';

        console.log(move);

        if (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].includes(piece)) {
            pawn = piece.toUpperCase();
            piece = 'P';
        }
        piece = piece.toUpperCase();

        let possibilities = {};
        Object.keys(game.moves()).forEach((key) => {
            if (game.moves()[key].includes(dest)) {
                possibilities[key] = board.pieces[key].toUpperCase();
            }
        });
        console.log(possibilities);
        possibleStarts = Object.keys(possibilities).filter((key) => possibilities[key] === piece);
        if (possibleStarts.length > 1) {
            if (piece === 'P') {
                for (let i = 0; i < possibleStarts.length; i++) {
                    if (possibleStarts[i].slice(0, 1) === pawn) {
                        start = possibleStarts[i];
                        break;
                        console.log("This move is valid!");
                    }
                }

                if (start.length < 2) {
                    message.reply("This move is invalid.");
                    return;
                }
            } else {

                let temp;
                switch (piece) {
                    case "R" :
                        temp = "rook";
                        break;
                    case "N" :
                        temp = "knight";
                        break;
                    case "B" :
                        temp = "bishop";
                        break;
                    case "Q" :
                        temp = "queen";
                        break;
                }

                if (move.length < 4) {

                    message.reply(`Please specify *which* ${temp} to move.`);
                    return;

                } else {

                    let specify = move.slice(1, 2);
                    if (!isNaN(parseInt(specify))) {

                        possibleStarts = Object.keys(possibilities).filter((key) => possibilities[key] === piece && parseInt(key.slice(1, 2)) === parseInt(specify));

                        if (possibleStarts.length > 1) {
                            message.reply(`Please specify your move with alphabetical file instead of numerical rank. (Ex. ${piece}cd1)`);
                            return;
                        } else if (possibleStarts.length === 1) {
                            start = possibleStarts[0];
                        } else {
                            message.reply(`There is no ${temp} on the ${specify}-rank.`);
                            return;
                        }

                    } else {
                        possibleStarts = Object.keys(possibilities).filter((key) => possibilities[key] === piece && key.slice(1, 2) === specify);

                        if (possibleStarts.length > 1) {
                            message.reply(`Please specify your move with numerical rank instead of alphabetical file. (Ex. ${piece}2c1)`);
                            return;
                        } else if (possibleStarts.length === 1) {
                            start = possibleStarts[0];
                        } else {
                            message.reply(`There is no ${temp} on the ${specify}-file.`);
                            return;
                        }

                    }
                }
            }
        } else if (possibleStarts.length === 1) {
            start = possibleStarts[0];
        } else {
            message.reply("This move is invalid.");
            return;
        }

        if (start.length === 2) {
            game.move(start, dest);
        }
    }

});


