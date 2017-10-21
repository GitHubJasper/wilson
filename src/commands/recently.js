const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");
const path = require("path");

var db = JSON.parse(fs.readFileSync(path.join(__dirname, '../') + `data.json`, "utf8"));

const api = new steam({
    apiKey: auth.key,
    format: "json"
});

module.exports.run = (client, message, args) => {
    db = JSON.parse(fs.readFileSync("./src/data.json", "utf8"));
    let user = message.mentions.users.first();
    if (!user) {
        user = message.author;
    }
    let steamid = db[user.id].steamid;
    if (!steamid) {
        message.channel.send("Please connect your steam profile first!");
        return;
    };
    api.getRecentlyPlayedGames({
        steamid: steamid,
        callback: function (err, data) {
            if (err) {
                console.error(err)
                return;
            }
            let count = data.response.total_count;
            let list = data.response.games;
            let embed = new Discord.RichEmbed().setTitle(`Recently Played`);
            embed.setDescription(`Showing games played by ${user.tag} in the last two weeks`)
            list.forEach((game, i) => {
                embed.addField(game.name, `${game.playtime_2weeks} minutes`);
            });
            message.channel.send(embed);
        }
    })
};

module.exports.help = {
    name: "Recently",
    command: "recently",
    required: 0,
    optional: 1,
    description: "Show recently played games."
}