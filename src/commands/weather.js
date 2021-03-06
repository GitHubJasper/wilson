const Discord = require("discord.js");
const weather = require("yahoo-weather");

module.exports.run = function(client, message, args) {
    let city = args[0];
    weather(city).then(info => {
        if (info) {
            let embed = new Discord.RichEmbed();
            embed
                .setTitle(`Weather in ${info.location.city}, ${info.location.country}`)
                .setURL(info.item.link.split('*')[1])
                .setDescription(`${info.item.title}`)
                .setFooter(`Weather data obtained from ${info.image.title}`)
                .addField('Maximum', `${info.item.forecast[0].high} °${info.units.temperature}`, true)
                .addField('Minimum', `${info.item.forecast[0].low} °${info.units.temperature}`, true)
                .addField('Recent', `${info.item.condition.temp} °${info.units.temperature}`, true)
                .addField('Wind Speed', `${info.wind.speed} ${info.units.speed}`, true)
                .addField('Humidity', `${info.atmosphere.humidity}%`, true)
                .addField('Condition', info.item.condition.text, true);
            message.channel.send(embed);
        } else {
            message.channel.send("No data!");
        }
    });
};

module.exports.help = {
    name: "Weather",
    command: "weather",
    required: 1,
    description: [
        "Give a quick weather report of a city."
    ],
    parameters: [
        ["location"]
    ]
}