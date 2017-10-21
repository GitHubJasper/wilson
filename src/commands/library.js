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
    let tags;
    if (!user) {
        tags = args[0];
        user = message.author;
    } else{
        tags = args[1];
    }
    let steamid = db[user.id].steamid;

    steam_extended.getGames({
        steamid : steamid,
        tagStringExp : tags, 
        callback: function (list, error) {
            switch(error){
                case 0:
                    let counter = 0;
                    let embed = new Discord.RichEmbed().setTitle(`${list.length} Games`);
                    if (tags != null){
                        embed.title = embed.title + ` that match "${tags}"`;
                    }
                    let msg = "";
                    list.forEach(function(game) {
                        if(msg.length + list[counter].name.length >= 2000){
                            embed.setFooter(`Only showing ${counter} out of ${list.length} games`)
                            return;
                        }
                        msg = msg.concat(`${list[counter].name}\n`);
                        counter++;
                    });
                    embed.setDescription(msg);
                    message.channel.send(embed);
                break;
                case 1:
                    message.channel.send("Sorry but you have no games, who are you??");
                break;
                case 4:
                    message.channel.send(`Sorry but you don't have any games that match the tags "${args[1]}"`);
                break;
                case -1:
                    message.channel.send("Could not find the steam account of " + user + " \nUse '!connect <steamid>' to connect your steam account");
                break;
                case -3:
                    message.channel.send("Hm I can not parse that expression...");
                break;
            };
        }
    });
};

module.exports.help = {
    name: "Library",
    command: "library",
    required: 0,
    optional: 2,
    description: "Show the games you own on steam."
}