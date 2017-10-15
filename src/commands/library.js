const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");

var db = JSON.parse(fs.readFileSync("./src/data.json", "utf8"));

const api = new steam({
    apiKey: auth.key,
    format: "json"
});

module.exports.run = (client, message, args) => {
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
            let counter = 0;
            let count = data.response.game_count;
            let list = data.response.games;
            let msg = "";
            while (msg.length + list[counter].name.length < 2000) {
                msg = msg.concat(`${list[counter].name}\n`);
                counter++;
            }
            let embed = new Discord.RichEmbed().setTitle(`${count} Games`);
            embed.setDescription(msg);
            if (counter < count) {
                embed.setFooter(`Only showing ${counter} out of ${count} games due to character limit`)
            }
            message.channel.send(embed);
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