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
    steamid = args[0]
    addUserID(user, message, steamid, addStrictUserID);
};

function addUserID(user, message, id, addStrict){
    api.resolveVanityURL({
        vanityurl: id,
        callback: function(err, data) {
            if (err) console.error(err);
            steamid = id
            if(data.response.success == 1){
                steamid = data.response.steamid
                console.log(steamid);
            }
            addStrict(user, message, steamid);
        }
    })
}

function addStrictUserID(user, message, steamid){
    api.getPlayerSummaries({
        steamids: steamid,
        callback: function (err, data) {
            if (err) console.error(err);
            let player = data.response.players[0];
            let embed = new Discord.RichEmbed().setTitle("Result");
            if (player) {
                embed
                    .setDescription(`Profile was found and is now bound to ${user.tag}`)
                    .addField("Username", `${player.personaname}`)
                    .addField("Visible", `${player.communityvisibilitystate}`)
                    .addField("ID", `${player.steamid}`)
                    .addField("URL", `${player.profileurl}`);
                db[user.id] = {
                    steamid: player.steamid
                };
                fs.writeFile("./src/data.json", JSON.stringify(db), (err) => {
                    if (err) console.error(err);
                });
            } else {
                embed
                    .setDescription("No profile was found")
            }
            message.channel.send(embed);
        }
    })
}
module.exports.help = {
    name: "Connect",
    command: "connect",
    required: 1,
    optional: 1
}