const { Intents, Client, WebhookClient, MessageEmbed, Collection, Permissions } = require("discord.js")
const allowedMentions = { parse: ['users', 'roles'], repliedUser: true }
const intents = [
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.GUILD_SCHEDULED_EVENTS
]

const client = new Client({ intents, allowedMentions })

const server = require("express")()
const config = { prefix, token, owner, mongoURL, swears, instagramAccout } = require("./config.js")
const { localTime, swearBlocker, randomId, adBlocker, uppercaseBlocker, instagramUser, translate } = require("./functions.js")
const fs = require("fs")
const mongoose = require('mongoose')
const mongoDBConnect = require('./mongoDB/connect.js')
const Models = require('./mongoDB/models.js')

require('dotenv').config()
require('dayjs/locale/tr')
require("dayjs").extend(require('dayjs/plugin/timezone'))
require("dayjs").extend(require('dayjs/plugin/utc'))
require("dayjs").locale('tr')

client.slashCommands = new Collection()
client.prefixCommands = new Collection()
client.selectMenus = new Collection()

fs.readdir("./events/", (err, files) => err ? console.log(err) : files.forEach(file => require(`./events/${file}`)))

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

//client.on('debug', e => console.log(e.replace(regToken, 'that was redacted')))
client.on("warn", e => console.log(e.replace(regToken, "that was redacted")))
client.on("error", e => console.log(e.replace(regToken, "that was redacted")))

server.listen(process.env.PORT || 8880)
server.use(function (req, res) {
    return res.json({ status: "online" })
})

mongoDBConnect(mongoose, process.env.MONGOURL || mongoURL)

let openSystemTry = 0;
openSystem()
async function openSystem() {
    setTimeout(async () => {
        if (openSystemTry == 50) return console.log("❎ Discord: Not Connection, because MongoDB not connection!")
        if (!mongoose?.connections[0]?.name) { openSystemTry++; return openSystem() }
        client.login(process.env.TOKEN || token)
            .then(() => console.log(`✅ Discord: @${client.user.username}`))
            .catch((err) => console.log("❎ Discord: Not Connection"))
    }, 500)
}

module.exports = {
    client, config: require("./config.js"), Models, localTime,
    swearBlocker, randomId, adBlocker, instagramUser, translate, uppercaseBlocker
}