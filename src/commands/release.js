const Discord = require("discord.js");
const tinyreq = require("tinyreq");
const cheerio = require("cheerio");

module.exports.run = (client, message, args) => {
    link = "http://www.metacritic.com/rss/games/";
    platform = "pc";
    time = 0;
    if (args[0] != null) {
        if (args[0] == "recent"){
            time = -1;
        } else if (args[0] == "upcoming"){
            time = 1;
        } else if(args[1] == null){
            platform = args[0];
        } 
        if(args[1] != null){
            platform = args[1];
        }
    }
    getResults(message);
};

function getResults(message){
    tinyreq(link + platform, function(err, body) {
        let $ = cheerio.load(body,{xmlMode:true});
        let recent_games = $("item");
        let embed = new Discord.RichEmbed().setTitle(``);
        compare = null;
        switch(time){
            case 1:
                embed.title += "Upcoming releases ";
                compare =  (gameDate) => gameDate > new Date();
            break;
            case -1:
                embed.title += "Recent releases ";
                compare =  (gameDate) => gameDate < new Date();
            break;
            case 0:
                embed.title += "Upcoming and recent releases ";
                compare =  (gameDate) => true;
            break;
        }
        embed.title += "on " + platform;
        embed.description = "";
        recent_games.each(function(i, game) {
            dateString = $(this).find("pubDate").text();
            let releaseDate = Date.parse(dateString);
            if(compare(releaseDate)){
                gameTitle = $(this).find("title").text().trim();
                embed.description +=  dateString.trim() + "\t**" + gameTitle + "**\n";
            }
        });
        message.channel.send(embed);
    });
}

module.exports.help = {
    name: "Recently released",
    command: "release",
    required: 0,
    optional: 2,
    description: [
        "Show pc games recently added to metacritic.",
        "Show 'upcoming' or 'recent' releases according to metacritic.",
        "Show games recently added to metacritic from a certain platform.",
        "Show 'upcoming' or 'recent' releases added to metacritic from a certain platform."
    ],
    parameters: [
        [],
        ["upcoming|recent"],
        ["platform [default:pc]"],
        ["upcoming|recent", "platform [default:pc]"]
    ]
}