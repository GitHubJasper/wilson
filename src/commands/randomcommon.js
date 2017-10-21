const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");
const path = require("path");

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
    if (!steamid) {
        message.channel.send("Please connect your steam profile first!");
        return;
    };
    if (!otherid) {
        message.channel.send("Other user has no steam profile connected!");
        return;
    };
    steam_extended.getCommonTagList(steamid, otherid, args, function sendResult(list, error){
        if (error == 1) {
            message.channel.send("Hm i can not parse that expression...");
            return;
        } else if(list.length > 0){
            let pick = list[Math.ceil(Math.random() * (list.length - 1))];
            let embed = new Discord.RichEmbed().setTitle(`Random game you have in common`);
            embed.setDescription("RNGsus has decided that you will play...");
            embed.addField(`${pick.name}`, `you played it for: ${pick.playtime_forever} minutes`);
            embed.setThumbnail(`http://media.steampowered.com/steamcommunity/public/images/apps/${pick.appid}/${pick.img_icon_url}.jpg`)
            message.channel.send(embed);
        } else{
            message.channel.send("Sorry but you don't have anything in common :(");
        }
    })
};

module.exports.help = {
    name: "Randomcommon",
    command: "randomcommon",
    required: 1,
    optional: 2,
    description: "Pick a random game that you have in common with anoth user."
}