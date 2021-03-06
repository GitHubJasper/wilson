const Discord = require("discord.js");
const sql = require("sqlite");
const auth = require("../auth.json");
const fs = require("fs");
const path = require("path");
const steam_extended = require("../utility/steam-web-extended");

var db = [];

module.exports.run = (client, message, args) => {
    db = JSON.parse(fs.readFileSync(path.join(__dirname, '../') + `data.json`, "utf8"));
    let user = message.author;
    let steamid = db[user.id].steamid;
    
    steam_extended.getGames({
        steamid: steamid,
        tagStringExp : args[0],
        callback : function sendResult(list, error) {
            switch(error){
                case 0:
                    let pick = list[Math.ceil(Math.random() * (list.length - 1))];
                    let embed = new Discord.RichEmbed().setTitle(`${pick.name}`);
                    embed.setColor(`#00adee`);
                    embed.setURL(`http://store.steampowered.com/app/${pick.appid}`);
                    embed.setDescription(`[Launch this game!](steam://rungameid/${pick.appid})`);
                    embed.setThumbnail(`http://media.steampowered.com/steamcommunity/public/images/apps/${pick.appid}/${pick.img_icon_url}.jpg`);
                    embed.setFooter(`${pick.playtime_forever} minutes played`);
                    message.channel.send(embed);
                break;
                case 1:
                    message.channel.send("Lol buy some games bruh @" + user);
                break;
                case 4:
                    message.channel.send(`You have no games with the tags "${args[0]}"`);
                break;
                case -1:
                    message.channel.send("Could not find the steam account of " + user + " \nUse '!connect <steamid>' to connect your steam account");
                break;
                case -3:
                    message.channel.send("Hm I can not parse that expression...");
                break;
            };
        }
    })
};

module.exports.help = {
    name: "Randomgame",
    command: "randomgame",
    required: 0,
    optional: 1,
    description: [
        "Pick a random game from your library.",
        "Pick a random game from your library given a set of tags. \n\tYou can combine tags like: co-op&multiplayer&!(fps|3dperson)"
    ],
    parameters: [
        [],
        ["tags"]
    ]
}