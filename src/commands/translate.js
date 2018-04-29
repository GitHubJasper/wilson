const Discord = require("discord.js");
const translate = require("google-translate-api");

/**
 * Translation function. I'll add description later because I'm lazy
 *
 * author: Luke Prananta
 * @param client
 * @param message
 * @param args
 */
module.exports.run = function(client, message, args) {

    let original = 'auto';
    let target = 'en';

    if (args[0] && args[1]) {
        original = args[0];
        target = args[1];
    } else if(args[0]) {
        target = args[0];
    }

    let channel = message.channel;

    console.log("Translation called")

    channel.fetchMessages({ limit: 2 })
        .then(messages => {
            message = messages.last().content;
            translate(message, {from: original, to: target}).then(result => {
                channel.send(result.text);
            }).catch(error => {
                console.error(error.message);
                let embed = new Discord.RichEmbed().setTitle("Error");
                embed.setDescription(error.message);
                channel.send(embed);
            });
        }).catch(console.error);
};

module.exports.help = {
    name: "Translate",
    command: "translate",
    required: 0,
    optional: 2,
    description: [
        "Translate last sent message in channel."
    ],
    parameters: [
        ["original language"],
        ["translated language"]
    ]
}