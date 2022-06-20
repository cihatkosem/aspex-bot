const mongoose = require('mongoose')

let guilds;
module.exports.guilds = guilds = mongoose.model("guilds", mongoose.Schema({
    guildId: { type: String, required: true },
    settings: {
        adBlocker: {
            channels: Array
        },
        swearBlocker: {
            channels: Array
        },
        uppercaseBlocker: {
            channels: Array
        },
        loginInfo: {
            status: String,
            channelId: String,
            channelWebhookID: String,
            channelWebhookTOKEN: String
        },
        logoutInfo: {
            status: String,
            channelId: String,
            channelWebhookID: String,
            channelWebhookTOKEN: String
        },
        spotifyPresence: {
            status: String,
            channelId: String,
            channelWebhookID: String,
            channelWebhookTOKEN: String
        },
    },
    messages: { type: Array, required: true, default: [] },
    transactions: { type: Array, required: true, default: [] },
}))

module.exports.functions = {
    guild: {
        create: async function guildsFunction(id) {
            await guilds.updateOne(
                { guildId: id }, {
                settings: {
                    swearBlocker: { channels: [] },
                    adBlocker: { channels: [] },
                    uppercaseBlocker: { channels: [] },
                    loginInfo: { status: "disable", channelId: "", channelWebhookID: "", channelWebhookTOKEN: "" },
                    logoutInfo: { status: "disable", channelId: "", channelWebhookID: "", channelWebhookTOKEN: "" },
                    spotifyPresence: { status: "disable", channelId: "", channelWebhookID: "", channelWebhookTOKEN: "" },
                },
                transactions: [],
                messages: []
            }, { upsert: true }
            ).catch((err) => console.log(err))
        }
    }
}