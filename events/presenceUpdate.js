const { client, localTime, config, Models } = require("../server")
const axios = require("axios")
const { WebhookClient, MessageEmbed } = require("discord.js")

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    let modelfetch = await Models.guilds.findOne({ guildId: newPresence?.guild?.id })
    let oldStatus = oldPresence?.clientStatus, newStatus = newPresence?.clientStatus
    if (oldStatus?.mobile && newStatus?.mobile && (!oldStatus?.web && newStatus?.web && !oldStatus?.desktop && newStatus?.desktop)) return;
    if (oldStatus?.web && newStatus?.web && (!oldStatus?.mobile && newStatus?.mobile || !oldStatus?.desktop && newStatus?.desktop)) return;
    if (oldStatus?.desktop && newStatus?.desktop && (!oldStatus?.web && newStatus?.web || !oldStatus?.mobile && newStatus?.mobile)) return;

    let Presence = (activities) => newPresence.activities.filter(f => f.name == activities)[0]
    let spotify = Presence("Spotify")

    if (spotify) {
        if (!modelfetch || !modelfetch.settings.spotifyPresence.channelId) return;
        let channel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(modelfetch.settings.spotifyPresence.channelId)
        let webhooks = async (channel) => channel.fetchWebhooks()
            .then(hooks => { return new Promise((resolve) => resolve(hooks)) })
            .catch((err) => { return new Promise((resolve) => resolve(null)) })
        let webhooksFetch = await webhooks(channel)
        let webhookfind = webhooksFetch?.filter(f => f.name == "Aspex Bilgilendirme").map(m => m)[0]

        let systemChannelId = client.guilds.cache.get(modelfetch.guildId).systemChannelId
        let firstChannelId = client.guilds.cache.get(modelfetch.guildId).channels.cache.filter(f => f.type == "GUILD_TEXT")?.map(m => m)[0]?.id
        let MessageChannel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(systemChannelId ? systemChannelId : firstChannelId)

        if (!webhooksFetch || !webhookfind)
            return channel.createWebhook('Aspex Bilgilendirme', { avatar: client.user.displayAvatarURL() })
                .then(() => {
                    MessageChannel.send(`> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, Spotify için webhook'u oluşturdum.`)
                })
                .catch((err) => {
                    try {
                        MessageChannel.send(
                            `> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, yetkim olmadığı için Spotify webhook'u oluşturamadım.`
                        )
                    } catch (err) { }
                })

        let spotifyPresence = modelfetch.settings.spotifyPresence
        if (!spotifyPresence.channelWebhookID || !spotifyPresence.channelWebhookTOKEN) {
            spotifyPresence.channelWebhookID = webhookfind.id
            spotifyPresence.channelWebhookTOKEN = webhookfind.token
            return modelfetch.save()
        }

        let spotifyWebhookURL = `https://discord.com/api/webhooks/${spotifyPresence.channelWebhookID}/${spotifyPresence.channelWebhookTOKEN}`

        let Info = new WebhookClient({ url: spotifyWebhookURL })
        let spotifyImg = "https://play-lh.googleusercontent.com/UrY7BAZ-XfXGpfkeWg0zCCeo-7ras4DCoRalC_WXXWTK9q5b0Iw7B0YQMsVxZaNB7DM"
        let embed = new MessageEmbed()
            .setColor(config.color)
            .setAuthor({
                name: spotify.details + " / " + spotify.state,
                iconURL: `https://i.scdn.co/image/${spotify.assets.largeImage.slice(8)}`,
                url: `https://open.spotify.com/track/${spotify.syncId}`
            })
            .setDescription(`**Müziği dinleyen:** <@${newPresence.userId}>`)

        await Info.send({ username: "Aspex Spotify", avatarURL: spotifyImg, embeds: [embed] })
    }
})