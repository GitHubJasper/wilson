const Discord = require("discord.js");
const auth = require("./auth.json");
const fs = require("fs");

/*
Todo: random game pick, check if both has game,
 */

const client = new Discord.Client();

client.commands = new Discord.Collection();

fs.readdir("./src/commands", (err, files) => {
    if (err) console.error(err);
    files.forEach((file, i) => {
        console.log(file);
        if (file.split(".")[1] !== "js") return;
        let cmd = require(`./commands/${file}`);
        if (cmd.help) {
            client.commands.set(cmd.help.command, cmd);
        };
    });
});

client.on('ready', (evt) => {
    console.log('Connected');
});

client.on('message', (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(auth.prefix)) {
        let msg = message.content.split(/\s+/g);
        let cmd = client.commands.get(msg[0].toLowerCase().slice(1));
        let args = msg.slice(1);
        if (cmd && validateArguments(cmd.help.required, args)) {
            cmd.run(client, message, args);
        }
    }

    //fluff
    if (message.content.toUpperCase() === 'MARCO') {
       message.channel.send('**Polo!**');
    };
    if (message.content.toUpperCase() === 'GEODUDE') {
       message.channel.send('https://i.imgur.com/YdVoIqp.png');
    }
    if (message.content.toUpperCase() === 'PRAISE BE') {
       let embed = new Discord.RichEmbed();
       embed
           .setColor(3447003)
           .setTitle("Me RNGsus")
           .setImage('https://s3.amazonaws.com/files.d20.io/images/33679087/1OxkRToSEBz_UbvRVrGp9A/med.jpg?1495996223971');
       message.channel.send(embed);
    }
});

function validateArguments(required, args) {
    return (required <= args.length);
}


client.login(auth.token);