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
            expression = parseExp(args[1]);
            console.log(expression);
            getGameTags(list, function (tagList){
                let matchList = [];
                tagList.forEach(function(element) {
                    if(expression.operator(element.tags)) {
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
 * Alles hieronder kan in een ander bestand (behalve de export)
 * En had nog geen zin om te commenten dus helaas
 */

function parseExp(Exp){
    let operator = parseGroup(Exp);
    if(operator != null){
        return operator;
    }
    operator = parseOr(Exp);
    if(operator != null){
        return operator;
    }
    operator = parseAnd(Exp);
    if(operator != null){
        return operator;
    }
    operator = parseInvert(Exp);
    if(operator != null){
        return operator;
    }
    if(!containForbidden(Exp)){
        return new unOp(contain, Exp);
    }
    return null;
}

function containForbidden(Exp){
    return Exp.indexOf('|') != -1 || Exp.indexOf('&') != -1 || Exp.indexOf('!') != -1 || Exp.indexOf(')') != -1 || Exp.indexOf('(') != -1;
}

function parseGroup(Exp){
    if(Exp.charAt(0) == "(" && Exp.charAt(Exp.length - 1) == ')' && matchEndIndex(Exp) == Exp.length - 1){
        return parseExp(Exp.substr(1, Exp.length -2));
    }
    return null;
}
function parseInvert(Exp){
    if(Exp.charAt(0) == '!'){
        let index = Exp.indexOf('!');
        let subExp = parseExp(Exp.substr(index+1));
        if(subExp != null){
            return new unOp(invert, subExp);
        }
    }
    return null;
}
function parseAnd(Exp){
    if(Exp.indexOf('&') != -1){
        let index = Exp.indexOf('&');
        let firstExp = parseExp(Exp.substr(0,index));
        let secondExp = parseExp(Exp.substr(index+1));
        if(firstExp != null && secondExp != null){
            return new binOp(and,firstExp,secondExp);
        }
    }
    return null;
}
function parseOr(Exp){
    if(Exp.indexOf('|') != -1){
        let index = Exp.indexOf('|');
        let firstExp = parseExp(Exp.substr(0,index));
        let secondExp = parseExp(Exp.substr(index+1));
        if(firstExp != null && secondExp != null){
            return new binOp(or,firstExp,secondExp);
        }
    }
    return null;
}

function matchEndIndex(string){
    let counter = 0;
    let index = 0;
    while(index < string.length ){
        currentChar = string.charAt(index);
        if(currentChar == '('){
            counter++;
        } else if (currentChar == ')'){
            counter--;
        }
        if(counter == 0){
            return index;
        }
        index++;
    }
    return -1;

}

function binOp(operator, firstExp, secondExp){
    this.operator = operator;
    this.firstExp = firstExp;
    this.secondExp = secondExp;
}

function unOp(operator, Exp){
    this.operator = operator;
    this.Exp = Exp;
}

function and(tags){
    let first = false;
    let second = false;
    if(this.firstExp instanceof unOp){
        first = this.firstExp.operator(tags, this.firstExp.Exp);
    } else{
        first = this.firstExp.operator(tags, this.firstExp.firstExp, this.firstExp.secondExp);
    }

    if(this.secondExp instanceof unOp){
        second = this.secondExp.operator(tags, this.secondExp.Exp);
    } else{
        second = this.secondExp.operator(tags, this.secondExp.firstExp, this.secondExp.secondExp);
    }
    return first && second;
}
function or(tags){
    let first = false;
    let second = false;
    if(this.firstExp instanceof unOp){
        first = this.firstExp.operator(tags, this.firstExp.Exp);
    } else{
        first = this.firstExp.operator(tags, this.firstExp.firstExp, Exp.firstExp.secondExp);
    }

    if(this.secondExp instanceof unOp){
        second = this.secondExp.operator(tags, this.secondExp.Exp);
    } else{
        second = this.secondExp.operator(tags, this.secondExp.firstExp, this.secondExp.secondExp);
    }
    return first || second;
}

function contain(tags){
    if(tags.indexOf(this.Exp) != -1) {
        return true;
    }
    return false;
}

function invert(tags){
    return !this.Exp.operator(tags, this.Exp);
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