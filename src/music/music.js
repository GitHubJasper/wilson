const Discord = require("discord.js");
const yt = require("ytdl-core");
const auth = require("../auth.json");
const search = require('youtube-search');
const fs = require("fs");
const path = require("path");

let queue = [];
let current = null;
let handler = null;
let connection = null;
let last = null;
let notification = new Discord.RichEmbed().setColor("1db954");
let opts = {
    maxResults: 1,
    key: auth.youtube
};

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
            connect(msg).then((obj) => {
                connection = obj;
                if (yt.validateURL(url)) {
                    yt.getInfo(url, (err, info) => {
                        if (err) {
                            msg.channel.send(`${err}`);
                            console.error(err)
                        } else {
                            add(msg, info, client)
                        }
                    })
                } else {
                    let query = "";
                    args.forEach(function(s) {
                        query += s + " "
                    });
                    console.log(query);
                    search(query, opts, (err, res) => {
                        if (err) {
                            msg.channel.send(`${err}`);
                            console.error(err)
                        } else {
                            add(msg, res[0], client)
                        }
                    })
                }
            }).catch(console.error);

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
                if (last) {
                    last.delete();
                }
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
                    list = list.concat(`1. [${current.title}](${current.url})\n`)
                }
                queue.forEach((song, index) => {
                    list = list.concat(`${index + 2}. [${song.title}](${song.url})\n`);
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

function add(msg, info, client) {
    //console.log(info)
    let url = info["link"];
    if (!url) {
        url = info["video_url"]
    }

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

function connect(msg) {
    let channel = msg.member.voiceChannel;
    if (!connection) {
        return channel.join()
    } else {
        return new Promise((resolve, reject) => {
            if (!connection) {
                reject("Something went wrong")
            } else {
                resolve(connection)
            }
        })
    }
}

function play(client) {
    let channel = client.channels.get(auth.playlist);
    if(queue.length < 1) {
        channel.send("Empty queue!");
        return;
    }

    current = queue[0];

    notification
        .setTitle(current.title)
        .setAuthor("Now playing")
        .setURL(current.url)
        .setFooter(`Added by ${current.user}`);

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