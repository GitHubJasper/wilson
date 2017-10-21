const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");
const path = require("path");
const steam_extended = require("../utility/steam-web-extended");

var db = [];

const api = new steam({
    apiKey: auth.key,
    format: "json"
});

module.exports.run = (client, message, args) => {
    db = JSON.parse(fs.readFileSync(path.join(__dirname, '../') + `data.json`, "utf8"));
    let user = message.author;
    let other = message.mentions.users.first();
    let steamid = db[user.id].steamid;
    let otherid = db[other.id].steamid;

    steam_extended.getCommonList({
        firstID : steamid, 
        secondID : otherid, 
        tagStringExp : args[1], 
        callback : function sendResult(list, error){
            switch(error){
                case 0:
                    let pick = list[Math.ceil(Math.random() * (list.length - 1))];
                    let embed = new Discord.RichEmbed().setTitle(`Random game you have in common`);
                    embed.setDescription("RNGsus has decided that you will play... \n[Launch game](steam://run/" + pick.appid + ")");
                    embed.addField(`${pick.name}`, `${pick.playtime_forever} minutes played`);
                    embed.setThumbnail(`http://media.steampowered.com/steamcommunity/public/images/apps/${pick.appid}/${pick.img_icon_url}.jpg`)
                    message.channel.send(embed);
                break;
                case 1:
                    message.channel.send("Lol buy some games bruh @" + user);
                break;
                case 2:
                    message.channel.send("Lol buy some games bruh @" + other);
                break;
                case 3:
                    message.channel.send("Sorry but you don't have anything in common :(");
                break;
                case 4:
                    message.channel.send(`You have no games in common given the tags "${args[1]}"`);
                break;
                case -1:
                    message.channel.send("Could not find the steam account of " + user + " \nUse '!connect <steamid>' to connect your steam account");
                break;
                case -2:
                    message.channel.send("Could not find the steam account of " + other + "\nUse '!connect <steamid>' to connect your steam account");
                break;
                case -3:
                    message.channel.send("Hm I can not parse that expression...");
                break;
            };
        }
    });
};

module.exports.help = {
    name: "Randomcommon",
    command: "randomcommon",
    required: 1,
    optional: 2,
    description: "Pick a random game that you have in common with another user."
}