const { localTime, Models, randomId } = require("../server")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "administrator",
    name: "kullanıcı-çıkış-bilgi",
    description: "Kullanıcı sunucudan çıktığında kullanıcı hakkında bilgi mesajı atılmasını sağlar.",
    options: [
        {
            name: "channel",
            description: "Bilgi mesajını göndermemiz için bir metin kanalı seçmelisiniz.",
            type: "CHANNEL",
            required: true,
        },
    ],

    run: async (client, interaction, args) => {
        if (!interaction) return;
        let channel = interaction.options.getChannel("channel")
        let modelfetch = await Models.guilds.findOne({ guildId: channel?.guildId || interaction?.guildId })
        let logoutInfo = modelfetch?.settings?.logoutInfo

        let IsItWorking = logoutInfo?.status
        let WorkingChannelId = IsItWorking == "enable" ? logoutInfo?.channelId : null

        if (channel?.type !== "GUILD_TEXT")
            return await interaction.reply({ content: `Bilgi mesajı yanlızca **metin kanalları**nda gönderilebilir. Lütfen bir **metin kanalı** seçiniz.` })

        if (!modelfetch) {
            await interaction.reply({ content: "Sunucu verisi daha önceden oluşturulmamış, lütfen biraz bekleyin." })
            await Models.functions.guild.create(channel.guildId)

            return setTimeout(async (modelfetch) => {
                let modelfetch1 = await Models.guilds.findOne({ guildId: channel?.guildId || interaction?.guildId })
                if (!modelfetch1) return await interaction.reply({ content: "Sunucu verisi oluşturulamadı! Lütfen sistem yöneticisi ile iletişime geçiniz." })

                const returnCommand = client.slashCommands.get(interaction.commandName)
                returnCommand.run(client, interaction, args)
            }, 5000)
        }

        let _channel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(channel.id)
        let webhooks = async (_channel) => _channel?.fetchWebhooks()
            .then(hooks => { return new Promise((resolve) => resolve(hooks)) })
            .catch((err) => { return new Promise((resolve) => resolve(null)) })
        let webhooksFetch = await webhooks(_channel)
        let webhookfind = webhooksFetch?.filter(f => f.name == `${client.user.username} Bilgilendirme`).map(m => m)[0]

        let systemChannelId = client.guilds.cache.get(modelfetch.guildId).systemChannelId
        let MessageChannel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(systemChannelId ? systemChannelId : interaction.channel.id)
        let returnCommand = client.slashCommands.get(interaction.commandName)

        await interaction.reply({ content: "İsteğiniz alındı, işlem devam ediyor.", ephemeral: true }).catch((err) => { })

        if (!webhooksFetch || !webhookfind) {
            return _channel.createWebhook(`${client.user.username} Bilgilendirme`, { avatar: client.user.displayAvatarURL() })
                .then(() => {
                    MessageChannel.send(`> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, eski üye bilgilendirme sistemi için webhook oluşturdum.`)
                    returnCommand.run(client, interaction, args)
                })
                .catch((err) => {
                    MessageChannel.send(`> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, yetkim olmadığı için eski üye bilgilendirme sistemi için webhook oluşturamadım.`)
                        .catch((err) => { })
                })
        }

        if (!webhookfind) return returnCommand.run(client, interaction, args)

        let content = WorkingChannelId !== channel.id ? `${interaction.member}, **Sunucu Eski Üye Bilgilendirme** özelliği açıldı.\n Herhangi bir kullanıcı sunucudan çıkış yaptığında bunu <#${channel.id}> kanalında görebileceksiniz.` :
            logoutInfo?.status == "enable" ? `${interaction.member}, **Sunucu Eski Üye Bilgilendirme** özelliği isteğiniz doğrultusunda kapatıldı.` :
                `${interaction.member}, **Sunucu Eski Üye Bilgilendirme** özelliği açıldı.\n Herhangi bir kullanıcı sunucuya giriş yaptığında bunu <#${channel.id}> kanalında görebileceksiniz.`

        if (WorkingChannelId !== channel.id) {
            await Models.guilds.updateOne(
                { guildId: interaction?.guildId || interaction?.guildId },
                { 'settings.logoutInfo': { status: "enable", channelId: channel.id } }
            )
        } else if (WorkingChannelId == channel.id) {
            logoutInfo.status = "disable"
            logoutInfo.channelId = ""
            logoutInfo.channelWebhookID = ""
            logoutInfo.channelWebhookTOKEN = ""
            modelfetch.save()
        }

        if (WorkingChannelId !== channel.id) {
            let _modelfetch = await Models.guilds.findOne({ guildId: channel?.guildId || interaction?.guildId })
            let _logoutInfo = _modelfetch?.settings?.logoutInfo
            if (!_logoutInfo.channelWebhookID || !_logoutInfo.channelWebhookTOKEN) {
                _logoutInfo.channelWebhookID = webhookfind.id
                _logoutInfo.channelWebhookTOKEN = webhookfind.token
                _modelfetch.save()
            }
        }

        await interaction.reply({ content }).catch(async () => await interaction.channel.send({ content }))
        
        await Models.guilds.updateOne({ guildId: channel?.guildId || interaction?.guildId }, {
            $push: {
                transactions: {
                    id: await randomId(18),
                    ownerId: interaction.member.id,
                    date: await localTime("DD MMMM YYYY HH.mm.ss"),
                    name: "Yeni üye bilgilendirme sisteminde değişiklik yapıldı.",
                    oldValue: IsItWorking == "enable" ? "açık" : "kapalı",
                    newValue: IsItWorking == "enable" ? "kapalı" : "açık"
                }
            }
        }, { upsert: true }).catch(err => console.log(err))
        return;
    }
}

