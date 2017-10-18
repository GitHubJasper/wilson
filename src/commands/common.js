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
    getCommonList(steamid, otherid, function sendMessage(list){
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
    });    
};

function getCommonList(steamid, otherid, callbackFunction){
    api.getOwnedGames({
        steamid: steamid,
        include_appinfo: 1,
        callback: (err, userdata) => {
            let appidsUser = [];
            userdata.response.games.forEach((game, _) => {
                appidsUser.push(game.appid);
            });
            list = generateList(appidsUser,otherid, userdata, callbackFunction);
        }
    });
}

function generateList(appidsUser, otherid, userdata, callbackFunction){
    let list
    api.getOwnedGames({
        steamid: otherid,
        include_appinfo: 1,
        callback: (err, otherdata) => {
            let appidsOther = [];
            otherdata.response.games.forEach((game, _) => {
                appidsOther.push(game.appid);
            });
            let commonIds = appidsUser.filter((id) => {
                return (appidsOther.indexOf(id) > -1)
            });
            list = userdata.response.games.filter((game) => {
                return (appidsOther.indexOf(game.appid) > -1)
            });
            console.log(list);
            callbackFunction(list);
        }
    })
}



module.exports.help = {
    name: "Common",
    command: "common",
    required: 0,
    optional: 1,
    description: "Show which games you have in common."
}