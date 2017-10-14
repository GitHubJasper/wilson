module.exports.run = (client, message, args) => {
    message.channel.send('pong!');
    console.log("Pong sent")
};

module.exports.help = {
    name: "Ping",
    command: "ping",
    required: 1
}