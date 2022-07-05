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

const config = { prefix, token, owner, mongoURL, swears, instagramAccout } = require("./config.js")
const { localTime, swearBlocker, randomId, adBlocker, uppercaseBlocker, instagramUser, translate } = require("./functions.js")
const fs = require("fs")
const mongoose = require('mongoose')
const mongoDBConnect = require('./mongoDB/connect.js')
const Models = require('./mongoDB/models.js')

const app = require("express")()
const express = require('express')
const path = require('path')
const server = require('http').createServer(app)
const passport = require('passport')
const DCStrategy = require('passport-discord').Strategy
const bodyParser = require('body-parser')
const session = require("express-session")
const rateLimit = require('express-rate-limit')
const pageLimit = rateLimit({ windowMs: 1000, max: 2, message: { err: "You exceeded the limit!" } })
const sessionArray = { secret: "~axpex", resave: false, saveUninitialized: false, cookie: { expires: 7 * 8640000 } }

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

mongoDBConnect(mongoose, process.env.MONGOURL || mongoURL)

client.login(process.env.TOKEN || token)
    .then(() => console.log(`✅ Discord: @${client.user.username}`))
    .catch((err) => console.log("❎ Discord: Not Connection"))


const hostURL = process.env.TOKEN ? `http://localhost:80` : `https://aspexbot.glitch.me`

let openSystemTry = 0;
openSystem()
async function openSystem() {
    setTimeout(async () => {
        if (openSystemTry == 50) return console.log("❎ Discord: Not Connection, because MongoDB not connection!")
        if (!client.user || !mongoose?.connections[0]?.name) { openSystemTry++; return openSystem() }
        server.listen(process.env.PORT || 80, async function (err) {
            err ? console.log(`❎ Website: Not Connection`) : console.log(`✅ Website: ${hostURL}`)
        })
    }, 500)
}

app.use(pageLimit)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session(sessionArray))
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine', 'ejs')
app.set('trust proxy', true)
app.use(express.static(path.join(__dirname, './views')))
app.set('views', require('path').join(__dirname, './views/'))

app.get("/", async (req, res) => {
    let guilds = []
    client.guilds.cache.sort(function(a, b){ return b.members.cache.size - a.members.cache.size }).map(m =>
        guilds.push({ 
            id: m.id, name: m.name, members: m.members.cache.size,
            icon: `https://cdn.discordapp.com/icons/${m.id}/${m.icon}.webp?size=160`
        })
    )
    res.render("index", { client, user: req.session.user, guilds })
})

app.get("/hakkinda", async (req, res) => {
    return res.render("about", {
        client, user: req.session.user
    })
})

passport.serializeUser((user, done) => { done(null, user) })
passport.deserializeUser((obj, done) => { done(null, obj) })
let clientID = process.env.clientID || config.clientID
let clientSecret = process.env.clientSecret || config.clientSecret
let callbackURL = hostURL + "/girisyap/discord"
let discordPassport = { clientID, clientSecret, callbackURL, scope: ['identify', 'email', 'guilds'], prompt: 'consent' }
passport.use(new DCStrategy(discordPassport, (accessToken, refreshToken, profile, done) => process.nextTick(() => done(null, profile))))

app.get('/cikisyap', async (req, res) => {
    if (!req.session.user) return res.redirect("/")
    req.session.user = null
    return res.redirect("/")
})

app.get('/girisyap/discord', passport.authenticate('discord', {
    failureRedirect: '/', successRedirect: "/girisyap/discord/dogrula"
}))

app.get("/girisyap/discord/dogrula", async (req, res) => {
    if (!req?.user || !req?.user?.id || !req?.user?.email || !req?.user?.guilds) return res.redirect("/girisyap/discord")
    req.session.user = req.user
    return res.redirect("/panel")
})

app.get("/profil", async (req, res) => {
    if (!req.session.user) return res.redirect("/girisyap/discord")
    let clientGuilds = client.guilds.cache.map(m => m.id)
    let jointGuilds = req.session.user.guilds.filter(f => clientGuilds.includes(f.id))
    let guilds = jointGuilds.filter(f => (parseInt(f.permissions) & 0x8 === 0x8))
    return res.render("profile", {
        client, user: req.session.user, guilds
    })
})

app.get(["/sunucular", "/sunucular/", "/sunucular/:id"], async (req, res) => {
    if (!req.params.id) return res.redirect("/")
    let guild = client.guilds.cache.get(req.params.id)
    if (!guild) return res.redirect("/")
    return res.render("server", {
        client, user: req.session.user, guild
    })
})

app.get(["/panel", "/panel/:server", "/panel/:server/:setting"], async (req, res) => {
    if (!req.session.user) return res.redirect("/girisyap/discord")
    let clientGuilds = client.guilds.cache.map(m => m.id)
    let jointGuilds = req.session.user.guilds.filter(f => clientGuilds.includes(f.id))
    let guilds = jointGuilds.filter(f => (parseInt(f.permissions) & 0x8 === 0x8))
    let paramsGuild = req.params.server ? guilds?.filter(f => f.id == req.params.server)[0] : null
    let guild = paramsGuild ? client.guilds.cache.get(paramsGuild.id) : null
    let guildModel = req.params.server ? await Models.guilds.findOne({ guildId: req.params.server }) : null
    let setting = req.params.setting
    if (!guildModel && paramsGuild) await Models.functions.guild.create(paramsGuild.id)

    if (req.query.swearblockerchannel) {
        if (!guildModel) return res.redirect(req.originalUrl)
        let channels = guildModel?.settings?.swearBlocker?.channels
        let channelBlock = channels?.filter(f => f == `${req.query.swearblockerchannel}`)
        let orderchannelsBlock = channels?.filter(f => f !== `${req.query.swearblockerchannel}`)

        if (channelBlock[0])
            await Models.guilds.updateOne({ guildId: paramsGuild.id }, { 'settings.swearBlocker.channels': orderchannelsBlock ? orderchannelsBlock : [] })
        else {
            channels.push(req.query.swearblockerchannel)
            guildModel.save()
        }
        return setTimeout(() => res.redirect(`/panel/${paramsGuild.id}/swear-blocker`), 1000)
    }

    if (req.query.adblockerchannel) {
        if (!guildModel) return res.redirect(req.originalUrl)
        let channels = guildModel?.settings?.adBlocker?.channels
        let channelBlock = channels?.filter(f => f == `${req.query.adblockerchannel}`)
        let orderchannelsBlock = channels?.filter(f => f !== `${req.query.adblockerchannel}`)

        if (channelBlock[0])
            await Models.guilds.updateOne({ guildId: paramsGuild.id }, { 'settings.adBlocker.channels': orderchannelsBlock ? orderchannelsBlock : [] })
        else {
            channels.push(req.query.adblockerchannel)
            guildModel.save()
        }
        return setTimeout(() => res.redirect(`/panel/${paramsGuild.id}/ad-blocker`), 1000)
    }

    if (req.query.uppercaseblockerchannel) {
        if (!guildModel) return res.redirect(req.originalUrl)
        let channels = guildModel?.settings?.uppercaseBlocker?.channels
        let channelBlock = channels?.filter(f => f == `${req.query.uppercaseblockerchannel}`)
        let orderchannelsBlock = channels?.filter(f => f !== `${req.query.uppercaseblockerchannel}`)

        if (channelBlock[0])
            await Models.guilds.updateOne({ guildId: paramsGuild.id }, { 'settings.uppercaseBlocker.channels': orderchannelsBlock ? orderchannelsBlock : [] })
        else {
            channels.push(req.query.uppercaseblockerchannel)
            guildModel.save()
        }
        return setTimeout(() => res.redirect(`/panel/${paramsGuild.id}/uppercase-blocker`), 1000)
    }

    if (req.query.joineduserchannel) {
        if (!guildModel) return res.redirect(req.originalUrl)
        let loginInfo = guildModel?.settings?.loginInfo
        if (req.query.joineduserchannel == loginInfo.channelId) {
            loginInfo.status = "disable"
            loginInfo.channelId = ""
            loginInfo.newMemberRoleId = ""
            loginInfo.channelWebhookID = ""
            loginInfo.channelWebhookTOKEN = ""
            guildModel.save()
        } else {
            let clientChannel = client.guilds.cache.get(paramsGuild.id).channels.cache.get(req.query.joineduserchannel)
            let webhook = fetchWebhook(req.query.joineduserchannel)
            if (!webhook) {
                return clientChannel.createWebhook(`${client.user.username} Bilgilendirme`, { avatar: client.user.displayAvatarURL() })
                .then(async () => {
                    console.log("hi")
                    await Models.guilds.updateOne(
                        { guildId: paramsGuild.id },
                        { 'settings.loginInfo': { status: "enable", channelId: req.query.joineduserchannel } }
                    )
                    setTimeout(async () => {
                        let _modelfetch = await Models.guilds.findOne({ guildId: paramsGuild.id })
                        let _loginInfo = _modelfetch?.settings?.loginInfo
                        if (!_loginInfo.channelWebhookID || !_loginInfo.channelWebhookTOKEN) {
                            _loginInfo.channelWebhookID = webhookfind.id
                            _loginInfo.channelWebhookTOKEN = webhookfind.token
                            _modelfetch.save()
                        }
                        return setTimeout(() => res.redirect(`/panel/${paramsGuild.id}/joined-user-information`), 500)
                    }, 1500);
                }).catch((err) => {
                    console.log("hi-ups")
                    res.redirect(req.originalUrl)
                })
            } else {
                await Models.guilds.updateOne(
                    { guildId: paramsGuild.id }, 
                    { 'settings.loginInfo': { status: "enable", channelId: req.query.joineduserchannel } }
                )
                return setTimeout(async () => {
                    let _modelfetch = await Models.guilds.findOne({ guildId: paramsGuild.id })
                    let _loginInfo = _modelfetch?.settings?.loginInfo
                    if (!_loginInfo.channelWebhookID || !_loginInfo.channelWebhookTOKEN) {
                        _loginInfo.channelWebhookID = webhook.id
                        _loginInfo.channelWebhookTOKEN = webhook.token
                        _modelfetch.save()
                    }
                    res.redirect(`/panel/${paramsGuild.id}/joined-user-information`)
                }, 1500);
            }
        }
    }

    if (req.query.leaveduserchannel) {
        if (!guildModel) return res.redirect(req.originalUrl)
        let logoutInfo = guildModel?.settings?.logoutInfo
        if (req.query.leaveduserchannel == logoutInfo.channelId) {
            logoutInfo.status = "disable"
            logoutInfo.channelId = ""
            logoutInfo.newMemberRoleId = ""
            logoutInfo.channelWebhookID = ""
            logoutInfo.channelWebhookTOKEN = ""
            guildModel.save()
        } else {
            let clientChannel = client.guilds.cache.get(paramsGuild.id).channels.cache.get(req.query.leaveduserchannel)
            let webhook = fetchWebhook(req.query.leaveduserchannel)
            if (!webhook) {
                return clientChannel.createWebhook(`${client.user.username} Bilgilendirme`, { avatar: client.user.displayAvatarURL() })
                .then(async () => {
                    console.log("hi")
                    await Models.guilds.updateOne(
                        { guildId: paramsGuild.id },
                        { 'settings.logoutInfo': { status: "enable", channelId: req.query.leaveduserchannel } }
                    )
                    setTimeout(async () => {
                        let _modelfetch = await Models.guilds.findOne({ guildId: paramsGuild.id })
                        let _logoutInfo = _modelfetch?.settings?.logoutInfo
                        if (!_logoutInfo.channelWebhookID || !_logoutInfo.channelWebhookTOKEN) {
                            _logoutInfo.channelWebhookID = webhookfind.id
                            _logoutInfo.channelWebhookTOKEN = webhookfind.token
                            _modelfetch.save()
                        }
                        return setTimeout(() => res.redirect(`/panel/${paramsGuild.id}/leaved-user-information`), 500)
                    }, 1500);
                }).catch((err) => {
                    console.log("hi-ups")
                    res.redirect(req.originalUrl)
                })
            } else {
                await Models.guilds.updateOne(
                    { guildId: paramsGuild.id }, 
                    { 'settings.logoutInfo': { status: "enable", channelId: req.query.leaveduserchannel } }
                )
                return setTimeout(async () => {
                    let _modelfetch = await Models.guilds.findOne({ guildId: paramsGuild.id })
                    let _logoutInfo = _modelfetch?.settings?.logoutInfo
                    if (!_logoutInfo.channelWebhookID || !_logoutInfo.channelWebhookTOKEN) {
                        _logoutInfo.channelWebhookID = webhook.id
                        _logoutInfo.channelWebhookTOKEN = webhook.token
                        _modelfetch.save()
                    }
                    res.redirect(`/panel/${paramsGuild.id}/leaved-user-information`)
                }, 1500);
            }
        }
    }

    return res.render("panel", {
        client, user: req.session.user, guilds, settings: config.settings,
        guild, guildModel, setting
    })
})

module.exports = {
    client, config: require("./config.js"), Models, localTime,
    swearBlocker, randomId, adBlocker, instagramUser, translate, uppercaseBlocker
}


async function fetchWebhook(channelId) {
    if (!client) return new Promise((resolve) => resolve(null))
    let _channel = client.channels.cache.get(channelId)
    let webhooks = async (_channel) => _channel?.fetchWebhooks()
        .then(hooks => { return new Promise((resolve) => resolve(hooks)) })
        .catch((err) => { return new Promise((resolve) => resolve(null)) })
    let webhooksFetch = await webhooks(_channel)
    let webhookfind = webhooksFetch?.filter(f => f.name == `${client.user.username} Bilgilendirme`).map(m => m)[0]
    return new Promise((resolve) => resolve(webhookfind))
}
