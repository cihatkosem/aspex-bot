const { client, config, Models } = require("../server")
const axios = require("axios")
const { WebhookClient, MessageEmbed } = require("discord.js")

client.on('guildMemberRemove', async (member) => {
    let modelfetch = await Models.guilds.findOne({ guildId: member?.guild?.id })
    let api = await axios.get(`https://drizzlydeveloper.xyz/api/discord/users/${member.id}`)
    let user = api?.data?.data ? api?.data?.data : null

    if (!modelfetch.settings.logoutInfo.channelId) return;

    let channel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(modelfetch.settings.logoutInfo.channelId)
    let webhooks = async (channel) => channel ? channel.fetchWebhooks()
        .then(hooks => { return new Promise((resolve) => resolve(hooks)) })
        .catch((err) => { return new Promise((resolve) => resolve(null)) }) : null
    let webhooksFetch = await webhooks(channel)
    let webhookfind = webhooksFetch?.filter(f => f.name == "Aspex Bilgilendirme").map(m => m)[0]

    let systemChannelId = client.guilds.cache.get(modelfetch.guildId).systemChannelId
    let firstChannelId = client.guilds.cache.get(modelfetch.guildId).channels.cache.filter(f => f.type == "GUILD_TEXT")?.map(m => m)[0]?.id
    let MessageChannel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(systemChannelId ? systemChannelId : firstChannelId)

    if (!webhookfind)
        return channel.createWebhook('Aspex Bilgilendirme', { avatar: client.user.displayAvatarURL() })
            .then(() => {
                MessageChannel.send(`> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, eski üye bilgilendirme sistemi için webhook'u oluşturdum.`)
            })
            .catch((err) => {
                MessageChannel.send(
                    `> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, yetkim olmadığı için eski üye bilgilendirme sistemi için webhook'u oluşturamadım.`
                ).catch((err) => {})
            })

    let logoutInfo = modelfetch.settings.logoutInfo
    if (!logoutInfo.channelWebhookID || !logoutInfo.channelWebhookTOKEN) {
        logoutInfo.channelWebhookID = webhookfind.id
        logoutInfo.channelWebhookTOKEN = webhookfind.token
        return modelfetch.save()
    }

    let logoutInfoWebhookURL = `https://discord.com/api/webhooks/${logoutInfo.channelWebhookID}/${logoutInfo.channelWebhookTOKEN}`

    let Info = new WebhookClient({ url: logoutInfoWebhookURL })

    let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
        .setDescription(
            `>  Ben <@${user.id}>, şuanda sunucudan çıkış yaptım. \n` +
            `${user.bot == "yes" || user.bot == "verified" ? "> Ben bir botum.\n" : ""}` +
            `> Hakkımda detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${user.id})`
        )
        .setThumbnail(user.avatarURL ? user.avatarURL + "?size=4096" : "")
        .setImage(user.bannerURL ? user.bannerURL + "?size=4096" : "")

    try {
        if (!user) return Info.send({ content: `:arrow_right: ${member} adlı kullanıcı çıkış yaptı.` })
        Info.send({
            username: user.username || member.user.username,
            avatarURL: user.avatarURL ? user.avatarURL + "?size=4096" : "" || member.user.displayAvatarURL(),
            embeds: [embed]
        })
    } catch (error) {
        console.log(error)
    }
})