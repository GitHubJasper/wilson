const Discord = require("discord.js");
const sql = require("sqlite");
const steam = require("steam-web");
const auth = require("../auth.json");
const fs = require("fs");
const tinyreq = require("tinyreq");
const cheerio = require("cheerio");
const path = require("path");

var db = JSON.parse(fs.readFileSync(path.join(__dirname, '../') + `data.json`, "utf8"));

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
    getCommonTagList(steamid, otherid, args, function sendResult(list){
        if(list.length > 0){
            let counter = 0;
            let msg = "";
            while (counter < list.length && msg.length + list[counter].name.length < 2000) {
                msg = msg.concat(`${list[counter].name}\n`);
                counter++;
            }
            let embed = new Discord.RichEmbed().setTitle(`${other.tag} has ${list.length} games in common`);
            if (args[1]) {
                embed.setTitle(`${other.tag} has ${list.length} games in common with the tag "${args[1]}"`)
            }
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
 * Returns a list that two users have in common
 * Matches tags if given
 * @param {*} steamid First user id
 * @param {*} otherid Second user id
 * @param {*} args Comman tags
 * @param {*} callbackFunction Function to give the list to
 */
function getCommonTagList(steamid, otherid, args, callbackFunction){
    getCommonList(steamid, otherid, function sendMessage(list){
        if(args[1]){
            getGameTags(list, function (tagList){
                let matchList = [];
                tagList.forEach(function(element) {
                    if(element.tags.indexOf(args[1]) != -1) {
                        matchList.push(element.game);
                    }
                });
                callbackFunction(matchList);
            })
        } else{
            callbackFunction(list);
        }
    });
}

/**
 * Gets a list of games two users have in common
 * @param {*} steamid First user id
 * @param {*} otherid Second user id
 * @param {*} callbackFunction Function to give the list to
 */
function getCommonList(steamid, otherid, callbackFunction){
    api.getOwnedGames({
        steamid: steamid,
        include_appinfo: 1,
        callback: (err, userdata) => {
            let appidsUser = [];
            userdata.response.games.forEach((game, _) => {
                appidsUser.push(game.appid);
            });
            generateList(appidsUser, userdata, otherid, callbackFunction);
        }
    });
}

/**
 * Generates a list of common game list from a users games and another users steam id
 * @param {*} appidsUser Appids from first user
 * @param {*} userdata userdata from first user
 * @param {*} otherid Second user id
 * @param {*} callbackFunction Function to give the list to
 */
function generateList(appidsUser, userdata, otherid, callbackFunction){
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
            callbackFunction(list);
        }
    })
}

/**
 * Gets all tags from a list of gameids
 * @param {*} gameList The gameid list
 * @param {*} callback Function to give the list to
 */
function getGameTags(gameList, callback){
    let tagList = [];
    gameList.forEach(function(currentGame) {
        tinyreq("http://store.steampowered.com/app/" + currentGame.appid + "/", function(err, body) {
            let $ = cheerio.load(body);
            var currentTags = $("a.app_tag").text().toLowerCase().replace(/\t| /g,'').split("\n");
            currentTags.shift();

            gameTag = {
                game: currentGame,
                tags: currentTags
            }
            tagList.push(gameTag);
            if(tagList.length == gameList.length){
                callback(tagList);
            }
        });
    });
}

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