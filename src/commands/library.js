const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");
const path = require("path");
const steam_extended = require("../utility/steam-web-extended.js");
const bf = require("../utility/binaryFilter.js");

var db = [];

const api = new steam({
    apiKey: auth.key,
    format: "json"
});

module.exports.run = (client, message, args) => {
    db = JSON.parse(fs.readFileSync(path.join(__dirname, '../') + `data.json`, "utf8"));
    let user = message.mentions.users.first();
    if (!user) {
        user = message.author;
    }
    let steamid = db[user.id].steamid;
    if (!steamid) {
        message.channel.send("Please connect your steam profile first!");
        return;
    };
    api.getOwnedGames({
        steamid: steamid,
        include_appinfo: 1,
        callback: function (err, data) {
            if (err) {
                console.error(err)
                return;
            }
            if(args[0] != null){
                let expression = bf.parseExp(args[0], (game,tag) => game.tags.indexOf(tag) != -1);
                if(expression == null){
                    message.channel.send("Hm i can not parse that expression...");
                    return;
                }
                steam_extended.getGameTags(data.response.games, function(list, error){
                    let gameList = list.filter(x => expression.match(x));
                    let counter = 0;
                    let count = gameList.length;
                    let msg = "";
                    while (counter < gameList.length && msg.length + gameList[counter].name.length < 2000) {
                        msg = msg.concat(`${gameList[counter].name}\n`);
                        counter++;
                    }
                    let embed = new Discord.RichEmbed().setTitle(`${count} Games`);
                    embed.setDescription(msg);
                    if (counter < count) {
                        embed.setFooter(`Only showing ${counter} out of ${count} games`)
                    }
                    message.channel.send(embed);
                });
            } else{
                let list = data.response.games;
                let counter = 0;
                let count = list.length;
                let msg = "";
                while (counter < list.length && msg.length + list[counter].name.length < 2000) {
                    msg = msg.concat(`${list[counter].name}\n`);
                    counter++;
                }
                let embed = new Discord.RichEmbed().setTitle(`${count} Games`);
                embed.setDescription(msg);
                if (counter < count) {
                    embed.setFooter(`Only showing ${counter} out of ${count} games`)
                }
                message.channel.send(embed);
            }
        }
    })
};

module.exports.help = {
    name: "Library",
    command: "library",
    required: 0,
    optional: 1,
    description: "Show the games you own on steam."
}