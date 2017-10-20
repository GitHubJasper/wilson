const bf = require("./binaryFilter.js");
const steam = require("steam-web");
const tinyreq = require("tinyreq");
const cheerio = require("cheerio");

const api = new steam({
    apiKey: "AA8856F9EA1EAC65DD3B09DD9077995C",
    format: "json"
});

module.exports = {
    /**
     * Returns a list that two users have in common
     * Matches tags if given
     * @param {*} steamid First user id
     * @param {*} otherid Second user id
     * @param {*} args Comman tags
     * @param {*} callbackFunction Function to give the list to
     */
    getCommonTagList : function(steamid, otherid, args, callbackFunction){
        let tagFunction = this.getGameTags;
        this.getCommonList(steamid, otherid, function sendMessage(list){
            if(args[1]){
                let expression = bf.parseExp(args[1], (game,tag) => game.tags.indexOf(tag) != -1);
                if(expression == null){
                    callbackFunction([]);
                }else{
                    tagFunction(list, function (tagList){
                        let matchList = tagList.filter(x => expression.match(x));
                        callbackFunction(matchList);
                    })
                }
            } else{
                callbackFunction(list);
            }
        });
    },

    /**
     * Gets a list of games two users have in common
     * @param {*} steamid First user id
     * @param {*} otherid Second user id
     * @param {*} callbackFunction Function to give the list to
     */
    getCommonList : function(steamid, otherid, callbackFunction){
        api.getOwnedGames({
            steamid: steamid,
            include_appinfo: 1,
            callback: (err, userdata) => {
                let games = userdata.response.games;
                generateList(games, otherid, callbackFunction);
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
            let appidsOther = [];
            let othergames = otherdata.response.games;
            let commonGames = games.filter((game) => {
                return (othergames.findIndex(x => x.appid==game.appid) > -1)
            });
            callbackFunction(commonGames);
        }
    })
}