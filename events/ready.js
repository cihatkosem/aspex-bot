const { client, config } = require("../server")
const loadCommands = require("../loadCommands")
const { ActivityType } = require("discord.js")

client.on('ready', async () => {
    await loadCommands()
    let number = 0
    await setActivity(config.activityes[0])
    async function setActivity(activity) {
        let text = activity.text
            .replace('website', process.env.TOKEN ? "drizzlydeveloper.xyz" : `www.aspex.gq`)
            .replace('guildsSize', `${client.guilds.cache.size}`)
            .replace('username', `${client.user.username}`)
        let status = process.env.TOKEN ?
            { type: ActivityType.Listening } :
            { type: ActivityType.Streaming, url: config.twitch }
        client.user.setActivity(`${text}`, status)
        number == config.activityes.length - 1 ? number = 0 : number++
        setTimeout(() => setActivity(config.activityes[number]), Number(activity.waitSecond + "000"))
    }
})