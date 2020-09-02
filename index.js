const Discord = require("discord.js");
const auth = require("./auth.json");
const readline = require("readline");
const { Chess } = require('chess.js');

var stockfish = require("stockfish");
var engine;

// command prefix
const prefix = "!";

// channels
const GENERAL = "704419428179378238";
const TESTING = "749700627277545543";

// global variables
var embed;
var game;
var currentPlayer;

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

function resetGame () {
    game.reset();
    game = null;
    currentPlayer = null;
    engine.postMessage("quit");
    engine = null;
}



client.login(auth.BOT_TOKEN);

rl.on('line', (input) => {
    client.channels.cache.get(GENERAL).send(input);
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
                .addField("Difficulty", "Value between 0 (Easiest) and 20 (Hardest)")
                .addField("Color", "White | Black | Random")
                );
            return;

        } else if (isNaN(parseInt(args[0])) || parseInt(args[0]) > 20 || parseInt(args[0]) < 0 || !['white', 'black', 'random'].includes(args[1].toString().toLowerCase())) {

            message.reply(
                embed.setTitle("Invalid Arguments")
                .addField("Syntax", "!game [difficulty] [color]")
                .addField("Difficulty", "Value between 0 (Easiest) and 20 (Hardest)")
                .addField("Color", "White | Black | Random")
                );
            return;
 
        }

        game = new Chess();
        currentPlayer = message.author;

        engine = stockfish();

        engine.onmessage = function onmessage(event) {

            console.log(event);
            console.log(typeof event)

            if (typeof event == 'string' && event.toString().indexOf("bestmove") > -1) {
                let line = event.split(" ");
                let bestmove = line[line.indexOf("bestmove") + 1];
                game.move(bestmove, {sloppy: true});

                let algebraic = game.history()[game.history().length - 1].toString();

                console.log(algebraic);

                if (game.in_draw()) {

                    let drawMethod;
                    if (game.in_stalemate()) drawMethod = "stalemate";
                    else if (game.in_threefold_repetition()) drawMethod = "threefold repetition";
                    if (game.insufficient_material()) drawMethod = "insufficient material";

                    resetGame();
                    client.channels.cache.get(TESTING).send(algebraic + `. **Draw** by ${drawMethod}.`, {reply: currentPlayer});

                } else if (game.in_checkmate()) {

                    resetGame();
                    client.channels.cache.get(TESTING).send(algebraic + ". **Checkmate!**", {reply: currentPlayer});

                } else if (game.in_check()) {

                    client.channels.cache.get(TESTING).send(algebraic + ". Check!", {reply: currentPlayer});

                } else {

                    client.channels.cache.get(TESTING).send(algebraic, {reply: currentPlayer});
                }

            }
        }

        engine.postMessage("isready");
        engine.postMessage("setoption name threads value 3");
        engine.postMessage("setoption name hash value 1024");
        engine.postMessage("setoption name ponder value false");
        engine.postMessage(`setoption name skill level value ${args[0]}`);
        engine.postMessage("position startpos");

        let color = args[1].toLowerCase();

        if (color == 'random') {
            color = ['white', 'black'][Math.floor(Math.random() * 2)];
        }

        if (color == "white") {

            game.header('White', currentPlayer.username, 'Black', 'RL Chess Bot (StockFish 11)');

        } else if (color == "black") {

            game.header('White', 'RL Chess Bot (StockFish 11)', 'Black', currentPlayer.username);
            engine.postMessage("go depth 13");
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

        if (game.in_draw()) {

            let drawMethod;
            if (game.in_stalemate()) drawMethod = "stalemate";
            else if (game.in_threefold_repetition()) drawMethod = "threefold repetition";
            if (game.insufficient_material()) drawMethod = "insufficient material";

            resetGame();
            client.channels.cache.get(TESTING).send(`**Draw** by ${drawMethod}.`, {reply: currentPlayer});

        } else if (game.in_checkmate()) {

            resetGame();
            client.channels.cache.get(TESTING).send("**Checkmate!** You win. ", {reply: currentPlayer});

        } else {

            engine.postMessage(`position fen ${game.fen()}`);
            engine.postMessage("go depth 13");

        }

        

    }



});
