const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");
const steam_extended = require("../utility/steam-web-extended.js");

var db = JSON.parse(fs.readFileSync("./src/data.json", "utf8"));

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
    let user = message.author;
    let other = message.mentions.users.first();
    if (!other) return;
    let steamid = db[user.id].steamid;
    let otherid = db[other.id].steamid;
    if (!steamid) {
        message.channel.send("Please connect your steam profile first!");
        return;
    };
    if (!otherid) {
        message.channel.send("Other user has no steam profile connected!");
        return;
    };
    steam_extended.getCommonTagList(steamid, otherid, args, function sendResult(list){
        if(list.length > 0){
            let counter = 0;
            let msg = "";
            while (msg.length + list[counter].name.length < 500) {
                msg = msg.concat(`${list[counter].name}\n`);
                counter++;
            }
            let embed = new Discord.RichEmbed().setTitle(`${other.tag} has ${list.length} games in common`);
            embed.setDescription(msg);
            if (counter < list.length) {
                embed.setFooter(`Only showing ${counter} out of ${list.length} games`)
            }
            message.channel.send(embed);
        } else{
            message.channel.send("Sorry but you don't have anything in common :(");
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