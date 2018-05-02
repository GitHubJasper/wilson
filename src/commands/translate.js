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
    let targetUser = message.mentions.users.first();

    if (targetUser) {
        if(args[1]) {
            target = args[1];
        }
    } else {
        if(args[0]) {
            target = args[0];
        }
    }

    let channel = message.channel;

    console.log("Translation called")

    channel.fetchMessages({ limit: 20 })
        .then(messages => {
            let filtered = messages.filter(m => m.content)
                .filter(m => !m.content.includes('!translate'))
                .filter(m => !m.author.bot);

            if (targetUser) {
                filtered = filtered.filter(m => m.author.equals(targetUser));
            }
            let message = filtered.first();
            if (!message) {
                embedError(channel, new Error('No message found to translate'));
            } else {
                translate(message.cleanContent, {from: original, to: target}).then(result => {
                    let embed = new Discord.RichEmbed();
                    embed.setDescription(result.text)
                        .setTitle(`Last message from ${message.author.username} translated to ${target.toUpperCase()}`)
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
    optional: 2,
    description: [
        "Translate last sent message in channel."
    ],
    parameters: [
        ["original language"],
        ["translated language"]
    ]
}