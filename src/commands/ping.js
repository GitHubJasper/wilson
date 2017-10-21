module.exports.run = (client, message, args) => {
    message.channel.send('pong!');
    console.log("Pong sent")
};

module.exports.help = {
    name: "Ping",
    command: "ping",
    required: 0,
    description: "1. Ping \n\t2. Pong. \n\t3. ??? \n\t4. PROFIT!!!",
    parameters: [[]]
}