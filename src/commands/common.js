const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");
const steam_extended = require("../utility/steam-web-extended.js");
const path = require("path");

var db = JSON.parse(fs.readFileSync(path.join(__dirname, '../') + `data.json`, "utf8"));

const api = new steam({
    apiKey: auth.key,
    format: "json"
});

/*
* THIS CODE IS A FUCKING MESS HOLY SHIT
*
* Todo: Refactoring
*
 */
module.exports.run = (client, message, args) => {
    db = JSON.parse(fs.readFileSync(path.join(__dirname, '../') + `data.json`, "utf8"));
    let user = message.author;
    let other = message.mentions.users.first();
    if (!other) return;
    let steamid = db[user.id].steamid;
    let otherid = db[other.id].steamid;
    
    steam_extended.getCommonList({
        firstID : steamid, 
        secondID : otherid, 
        tagStringExp : args[1], 
        callback : function sendResult(list, error){
            switch(error){
                case 0:
                    let counter = 0;
                    let msg = "";
                    while (counter < list.length && msg.length + list[counter].name.length < 2000) {
                        msg = msg.concat(`${list[counter].name}\n`);
                        counter++;
                    }
                    let embed = new Discord.RichEmbed().setTitle(`${other.tag} has ${list.length} games in common`);
                    if (args[1]) {
                        embed.setTitle(`${other.tag} has ${list.length} games in common with the tag "${args[1]}"`)
                    }
                    embed.setDescription(msg);
                    if (counter < list.length) {
                        embed.setFooter(`Only showing ${counter} out of ${list.length} games`)
                    }
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

/**
 * Load app page and give tags to callback function
 */
module.exports.help = {
    name: "Common",
    command: "common",
    required: 1,
    optional: 2,
    description: "Show which games you have in common."
}