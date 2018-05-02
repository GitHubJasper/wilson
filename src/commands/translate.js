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

    if(args[0]) {
        target = args[0];
    }

    let channel = message.channel;

    console.log("Translation called")

    channel.fetchMessages({ limit: 20 })
        .then(messages => {
            message = messages.filter(m => m.content)
                .filter(m => !m.content.includes('!translate'))
                .first();
            if (!message) {
                embedError(channel, new Error('No message found to translate'))
            } else {
                translate(message.cleanContent, {from: original, to: target}).then(result => {
                    let embed = new Discord.RichEmbed().setTitle(message.author.username);
                    embed.setDescription(result.text);
                    channel.send(embed);
                }).catch(error => {
                    embedError(channel, error)
                });
            }
        }).catch(console.error);
};

function embedError(channel, error){
    console.error(error.message);
    let embed = new Discord.RichEmbed().setTitle("Error");
    embed.setDescription(error.message);
    channel.send(embed);
}

module.exports.help = {
    name: "Translate",
    command: "translate",
    required: 0,
    optional: 1,
    description: [
        "Translate last sent message in channel."
    ],
    parameters: [
        ["original language"],
        ["translated language"]
    ]
}