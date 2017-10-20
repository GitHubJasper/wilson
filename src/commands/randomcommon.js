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
            let pick = data.response.games[Math.ceil(Math.random() * (data.response.game_count - 1))];
            let embed = new Discord.RichEmbed().setTitle(`Random game from your library`);
            embed.setDescription("RNGsus has decided that you will play...");
            embed.addField(`${pick.name}`, `${pick.playtime_forever} minutes played`);
            embed.setThumbnail(`http://media.steampowered.com/steamcommunity/public/images/apps/${pick.appid}/${pick.img_icon_url}.jpg`)
            message.channel.send(embed);
        }
    })
};

module.exports.help = {
    name: "Randomgame",
    command: "randomgame",
    required: 0,
    optional: 1,
    description: "Pick a random game from your library."
}