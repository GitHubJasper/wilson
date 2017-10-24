const Discord = require("discord.js");

module.exports.run = (client, message, args) => {
    let embed = new Discord.RichEmbed().setTitle("Pong!").setColor(`#00adee`);
    embed.setDescription(`${client.ping} ms`);
    message.channel.send(embed);
    console.log("Pong!")
};

module.exports.help = {
    name: "Ping",
    command: "ping",
    required: 0,
    description: "1. Ping \n\t2. Pong. \n\t3. ??? \n\t4. PROFIT!!!",
    parameters: [[]]
};