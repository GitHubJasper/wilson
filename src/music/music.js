const Discord = require("discord.js");
const yt = require("ytdl-core");
const auth = require("../auth.json");
const fs = require("fs");
const path = require("path");

var queue = [];
var current = null;
var handler = null;
var connection = null;
var last = null;
var notification = new Discord.RichEmbed().setColor("1db954");

/**
 * Look at that spaghetti code
 *
 * Todo: refactoring
 *
 */
module.exports.commands = [
    {
        command: "play",
        run: (client, msg, args) => {
            if (!connection) {
                connect(msg);
            }
            if (handler) {
                handler.resume();
                notification
                    .setAuthor("Resumed");
                update(msg.channel);
            } else {
                play(client);
            }
            msg.delete();
        }
    },
    {
        command: "pause",
        run: (client, msg, args) => {
            if (handler) {
                handler.pause();
                notification
                    .setAuthor("Paused");
                update(msg.channel);
            }
            msg.delete();
        }
    },
    {
        command: "stop",
        run: (client, msg, args) => {
            msg.delete();
        }
    },
    {
        command: "q",
        run: (client, msg, args) => {
            let url = args[0];
            if (!url) return;
            if (!connection) {
                connect(msg);
            }
            yt.getInfo(url, (err, info) => {
                if (err) {
                    msg.channel.send(`${err}`);
                    console.error(err);
                } else {
                    notification
                        .setTitle(info["title"])
                        .setAuthor("Added to the queue")
                        .setURL(url)
                        .setFooter(`Added by ${msg.author.tag}`);

                    msg.channel.send(notification).then((obj) => {
                        obj.delete(10000);
                    });

                    queue.push({
                        title: info["title"],
                        url: url,
                        user: msg.author.tag
                    });

                    msg.delete();

                    if (!handler) {
                        play(client);
                    }

                }
            })
        },
        required: 1
    },
    {
        command: "clear",
        run: (client, msg, args) => {
            queue = [];
            msg.channel.send("Queue has been cleared!");
            msg.delete();
        }
    },
    {
        command: "skip",
        run: (client, msg, args) => {
            if (handler) {
                handler.end();
            }
            msg.delete();
        }
    },
    {
        command: "playing",
        run: (client, msg, args) => {
            if (current) {
                notification
                    .setTitle(current.title)
                    .setAuthor("Now playing")
                    .setURL(current.url)
                    .setFooter(`Added by ${current.user}`);
                update(msg.channel);
            }
            msg.delete();
        }
    },
    {
        command: "join",
        run: (client, msg, args) => {
            let channel = msg.member.voiceChannel;
            channel.join()
                .then(obj => {connection = obj;})
                .catch(console.error);
            msg.delete();
        }
    },
    {
        command: "leave",
        run: (client, msg, args) => {
            if (connection) {
                connection.channel
                    .leave();
                connection = null;
            }
            msg.delete();
        }
    },
    {
        command: "reset",
        run: (client, msg, args) => {
            let channel = client.channels.get(auth.voice);
            if (connection) {
                connection.channel.leave();
            }
            queue = [];
            channel.join()
                .then(obj => {
                    console.log("Voice connected!");
                    connection = obj;
                })
                .catch(console.error);
            msg.delete();
        }
    },
    {
        command: "list",
        run: (client, msg, args) => {
            let embed = new Discord.RichEmbed().setColor("1db954");
            embed.setTitle("Queue");
            if (queue.length > 0 || current !== null) {
                let list = "";
                if (current) {
                    list = list.concat(`1. ${current.title} (${current.user})\n`)
                }
                queue.forEach((song, index) => {
                    list = list.concat(`${index + 2}. ${song.title} (${song.user})\n`);
                });
                embed.setDescription(list);
            } else {
                embed.setTitle("Empty!");
            }
            msg.channel.send(embed);
            msg.delete();
        }
    },
];

function connect(msg) {
    let channel = msg.member.voiceChannel;
    channel.join().then(obj => {
        connection = obj;
    }).catch(console.error);
}

function play(client) {
    let channel = client.channels.get(auth.playlist);
    if(queue.length < 1) {
        channel.send("Empty queue!");
        return;
    }

    current = queue[0];

    notification
        .setTitle(queue[0].title)
        .setAuthor("Now playing")
        .setURL(queue[0].url)
        .setFooter(`Added by ${queue[0].user}`);

    update(channel);

    let stream = yt(queue[0].url, {audioonly: true});
    handler = connection.playStream(stream);

    handler.once("end", (_) => {
        handler = null;
        current = null;
        if (queue.length > 0) {
            play(client);
        } else {
            notification.setAuthor("Queue finished");
            update(channel);
        }
    });

    queue.shift();
}

function update(channel) {
    channel.send(notification).then((msg) => {
        if (last) {
            last.delete();
        }
        last = msg;
    });
}