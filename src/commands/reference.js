const Discord = require("discord.js");

module.exports.run = (client, msg, args) => {
  let embed = new Discord.RichEmbed().setColor(`#00adee`);
  msg.channel.fetchMessage(args[0])
  .then(message => {
    if (message) {
      embed.setTitle(`${message.author.username} referenced by ${msg.author.username}`);
      embed.setDescription(message.content);
      msg.channel.send(embed);
    }
  })
  .catch(error => {
    if (error) {
      embed.setDescription(`Can't find message with ID: ${args[0]}`);
      msg.channel.send(embed);
    }
  });
  if (msg.channel.permissionsFor(client.user).has("MANAGE_MESSAGES")) {
    msg.delete();
  }
};

module.exports.help = {
    name: "Reference",
    command: "reference",
    required: 1,
    description: [
        "References previous message"
    ],
    parameters: [[]]
};