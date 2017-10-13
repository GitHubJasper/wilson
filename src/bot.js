const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require("./auth.json");

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
});

client.login(auth.token);