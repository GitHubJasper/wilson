const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require("./auth.json");
//const sql = require("sqlite");


client.on('ready', function (evt) {
    console.log('Connected');
});

client.on('message', function(message) {
   if (message.content.toUpperCase() === 'MARCO') {
       message.channel.send('**Polo!**');
    };
   if (message.content.toUpperCase() === 'GEODUDE') {
       message.channel.send('https://i.imgur.com/YdVoIqp.png');
   }
   if (message.content.toUpperCase() === 'PRAISE BE') {
       let embed = new Discord.RichEmbed();
       embed
           .setColor(3447003)
           .setTitle("Me RNGsus")
           .setImage('https://s3.amazonaws.com/files.d20.io/images/33679087/1OxkRToSEBz_UbvRVrGp9A/med.jpg?1495996223971');
       message.channel.send(embed);
   }
});

client.login(auth.token);