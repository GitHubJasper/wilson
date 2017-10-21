const bf = require("./binaryFilter.js");
const steam = require("steam-web");
const auth = require("../auth.json");
const tinyreq = require("tinyreq");
const cheerio = require("cheerio");

const api = new steam({
    apiKey: auth.key,
    format: "json"
});

module.exports = {

    /**
     * Returns a list that two users have in common
     * Matches tags if given
     * @param {*} steamid First user id
     * @param {*} otherid Second user id
     * @param {*} tagStringExp Tagstring in the form of an expression: co-op, co-op&multiplayer, etc.
     * @param {*} callbackFunction Function to return the list to also returns an error code 
     * Info:  (0 = Good, 1 = first user has no games, 2 = second user has no games, 3 = no games in common, 3 = no games in common that match tag)
     * Error: (-1 = first ID was not provided, -2 = second ID was not provided, -3 = error parsing tag string, -4 = ERROR YOU CAN'T RECEIVE CUZ YOU DIDN'T PROVIDE AN CALLBACK FUNCTION!)
     */
    getCommonList : function(options){
        if(options.callback == null){
            return;
        }
        if(options.firstID == null){
            options.callback([],-1)
            return;
        }
        if(options.secondID == null){
            options.callback([],-2)
            return;
        }
        let tagFunction = this.getGameTags;
        getCommonGames(options.firstID, options.secondID, function sendMessage(list, error){
            if(error != 0) {
                options.callback([], error);
            }
            let expression = bf.parseExp(options.tagStringExp, (game,tag) => game.tags.indexOf(tag) != -1);
            if(expression == null) {
                options.callback([], -3);
            }else {
                tagFunction(list, function (tagList){
                    let matchList = tagList.filter(x => expression.match(x));
                    if(matchList.length == 0){
                        options.callback([], 4);
                        return;
                    }
                    options.callback(matchList, 0);
                })
            }
        });
    },

    /**
     * Returns library of games that matches a certain tag from a user
     * 
     * @param {*} steamid Users steamID
     * @param {*} tagString Optional tagstring in the form of an expression: co-op, co-op&multiplayer, etc.
     * @param {*} callbackFunction Function to return the list to also returns an error code (0 = Good, 1 = no games found, 3 = no games match tag, -1 = error parsing expression)
     * Info:  (0 = Good, 1 = user has no games, 3 = no games match tag)
     * Error: (-3 = error parsing tag string)
     */
    getGames : function(options){
        if(options.callback == null){
            return;
        }
        if(options.steamid == null){
            options.callback([],-1)
            return;
        }
        let tagFunction = this.getGameTags;
        api.getOwnedGames({
            steamid: options.steamid,
            include_appinfo: 1,
            callback: function (err, data) {
                if(err){
                    options.callback([],-1);
                    return;
                }
                gameList = data.response.games;
                if (gameList.length == 0){
                    options.callback(gameList, 1);
                    return;
                }
                let expression = bf.parseExp(options.tagStringExp, (game,tag) => game.tags.indexOf(tag) != -1);
                if(expression == null){
                    options.callback([], -3);
                    return;
                }
                tagFunction(gameList, function (tagList){
                    let matchList = tagList.filter(x => expression.match(x));
                    if(matchList.length == 0){
                        options.callback([], 3);
                        return;
                    }
                    options.callback(matchList, 0);
                })
            }
        });
    },

    /**
     * Gets all tags from a list of gameids
     * @param {*} gameList The game list
     * @param {*} callback Function to give the list to
     */
    getGameTags : function(gameList, callback){
        let tagList = [];
        gameList.forEach(function(currentGame) {
            let url = "http://store.steampowered.com/app/" + currentGame.appid + "/";
            tinyreq(url, function(err, body) {
                let $ = cheerio.load(body);
                var currentTags = $("a.app_tag").text().toLowerCase();
                currentTags = currentTags.replace(/\t| /g,'').split("\n");
                currentTags.shift();

                currentGame.tags = currentTags;
                tagList.push(currentGame);
                if(tagList.length == gameList.length){
                    callback(tagList);
                }
            });
        });
    }
};

/**
 * Gets a list of games two users have in common
 * @param {*} steamid First user id
 * @param {*} otherid Second user id
 * @param {*} callbackFunction Function to give the list to
 */
function getCommonGames(steamid, otherid, callbackFunction){
    api.getOwnedGames({
        steamid: steamid,
        include_appinfo: 1,
        callback: (err, userdata) => {
            if(err){
                callbackFunction([],-1);
                return;
            }
            let games = userdata.response.games;
            if(games.length == 0){
                callbackFunction([], 1);
                return;
            }
            generateList(games, otherid, callbackFunction);
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
function generateList(games, otherid, callbackFunction){
    let list;
    api.getOwnedGames({
        steamid: otherid,
        include_appinfo: 1,
        callback: (err, otherdata) => {
            if(err){
                callbackFunction([],-2);
                return;
            }
            let appidsOther = [];
            let othergames = otherdata.response.games;
            if(othergames.length == 0){
                callbackFunction([], 2);
                return;
            }
            let commonGames = games.filter((game) => {
                return (othergames.findIndex(x => x.appid==game.appid) > -1)
            });
            if(commonGames.length == 0){
                callbackFunction([], 3);
            }
            callbackFunction(commonGames, 0);
        }
    })
}