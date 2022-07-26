const { WebhookClient, EmbedBuilder, ChannelType } = require("discord.js")
const { client, config, Models } = require("../server")
const axios = require("axios")

client.on('guildMemberAdd', async (member) => {
    let modelfetch = await Models.guilds.findOne({ guildId: member?.guild?.id })
    let api = await axios.get(`https://drizzlydeveloper.xyz/api/discord/users/${member.id}`)
    let user = api?.data?.data ? api?.data?.data : null

    if (!modelfetch.settings.loginInfo.channelId) return;

    let channel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(modelfetch.settings.loginInfo.channelId)
    let webhooks = async (channel) => channel.fetchWebhooks()
        .then(hooks => { return new Promise((resolve) => resolve(hooks)) })
        .catch((err) => { return new Promise((resolve) => resolve(null)) })
    let webhooksFetch = await webhooks(channel)
    let webhookfind = webhooksFetch?.filter(f => f.name == "Aspex Bilgilendirme").map(m => m)[0]

    let systemChannelId = client.guilds.cache.get(modelfetch.guildId).systemChannelId
    let firstChannelId = client.guilds.cache.get(modelfetch.guildId).channels.cache.filter(f => f.type == ChannelType.GuildText)?.map(m => m)[0]?.id
    let MessageChannel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(systemChannelId ? systemChannelId : firstChannelId)

    if (!webhookfind)
        return channel.createWebhook('Aspex Bilgilendirme', { avatar: client.user.displayAvatarURL() })
            .then(() => {
                MessageChannel.send(`> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, yeni üye bilgilendirme sistemi için webhook'u oluşturdum.`)
            })
            .catch((err) => {
                MessageChannel.send(
                    `> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, yetkim olmadığı için yeni üye bilgilendirme sistemi için webhook'u oluşturamadım.`
                ).catch((err) => {})
            })

    let loginInfo = modelfetch.settings.loginInfo
    if (!loginInfo.channelWebhookID || !loginInfo.channelWebhookTOKEN) {
        loginInfo.channelWebhookID = webhookfind.id
        loginInfo.channelWebhookTOKEN = webhookfind.token
        return modelfetch.save()
    }

    let loginInfoWebhookURL = `https://discord.com/api/webhooks/${loginInfo.channelWebhookID}/${loginInfo.channelWebhookTOKEN}`

    let Info = new WebhookClient({ url: loginInfoWebhookURL })

    let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
        .setDescription(
            `> Merhaba ben <@${user.id}>, şuanda sunucuya giriş yaptım. \n` +
            `${user.bot == "yes" || user.bot == "verified" ? "> Ben bir botum.\n" : ""}` +
            `> Hakkımda detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${user.id})`
        )
        .setThumbnail(user.avatarURL ? user.avatarURL + "?size=4096" : "")
        .setImage(user.bannerURL ? user.bannerURL + "?size=4096" : "")

    try {
        if (!user) return Info.send({ content: `:arrow_right: ${member} adlı kullanıcı giriş yaptı.` })
        Info.send({
            username: user.username || member.user.username,
            avatarURL: user.avatarURL ? user.avatarURL + "?size=4096" : "" || member.user.displayAvatarURL(),
            embeds: [embed]
        })
    } catch (error) {
        console.log(error)
    }
})