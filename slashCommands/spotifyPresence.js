const { MessageEmbed, Permissions } = require("discord.js")
const { client, config, localTime, Models, randomId } = require("../server")
const axios = require("axios")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "administrator",
    name: "spotify-bilgi",
    description: "Kullanıcıların anlık Spotify'da dinledikleri müzikler hakkında bilgilendir.",
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
        let spotifyPresence = modelfetch?.settings?.spotifyPresence
        
        let IsItWorking = spotifyPresence?.status
        let WorkingChannelId = IsItWorking == "enable" ? spotifyPresence?.channelId : null

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
        let webhookfind = webhooksFetch?.filter(f => f.name == "Aspex Bilgilendirme").map(m => m)[0]
      
        let systemChannelId = client.guilds.cache.get(modelfetch.guildId).systemChannelId
        let MessageChannel = client.guilds.cache.get(modelfetch.guildId).channels.cache.get(systemChannelId ? systemChannelId : interaction.channel.id)
        let returnCommand = client.slashCommands.get(interaction.commandName)
        
        await interaction.reply({ content: "İsteğiniz alındı, işlem devam ediyor.", ephemeral: true }).catch((err) => { })
      
        if (!webhooksFetch || !webhookfind) {
              return _channel.createWebhook('Aspex Bilgilendirme', { avatar: client.user.displayAvatarURL() })
                  .then(() => {
                      MessageChannel.send(`> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, Spotify için webhook'u oluşturdum.`)
                      returnCommand.run(client, interaction, args)
                  })
                  .catch((err) => {
                      try { 
                          MessageChannel.send(
                            `> Sayın yönetici <@${client.guilds.cache.get(modelfetch.guildId).ownerId}>, yetkim olmadığı için Spotify webhook'u oluşturamadım. \n` + 
                              "Yetki verdikten sonra Spotify'da çalmakta olan müziği değiştiriniz."
                          )
                      } catch (err) { }
                  })
        }
        
        if (!webhookfind) return returnCommand.run(client, interaction, args)
        
        let content = WorkingChannelId !== channel.id ? `${interaction.member}, **Spotify Müzik Bilgilendirme** özelliği açıldı.\n Herhangi bir kullanıcı Spotify'dan müzik açtığında bunu <#${channel.id}> kanalında görebileceksiniz.` :
            spotifyPresence?.status == "enable" ? `${interaction.member}, **Spotify Müzik Bilgilendirme** özelliği isteğiniz doğrultusunda kapatıldı.` :
                `${interaction.member}, **Spotify Müzik Bilgilendirme** özelliği açıldı.\n Herhangi bir kullanıcı Spotify'dan müzik açtığında bunu <#${channel.id}> kanalında görebileceksiniz.`

        if (WorkingChannelId !== channel.id) {
            await Models.guilds.updateOne(
                { guildId: interaction?.guildId || interaction?.guildId },
                { 'settings.spotifyPresence': { status: "enable", channelId: channel.id } }
            )
        } else if (WorkingChannelId == channel.id) {
            spotifyPresence.status = "disable"
            spotifyPresence.channelId = ""
            spotifyPresence.channelWebhookID = ""
            spotifyPresence.channelWebhookTOKEN = ""
            modelfetch.save()
        }
      
        if (WorkingChannelId !== channel.id) {
          let _modelfetch = await Models.guilds.findOne({ guildId: channel?.guildId || interaction?.guildId })
          let _spotifyPresence = _modelfetch?.settings?.spotifyPresence
          if (!_spotifyPresence.channelWebhookID || !_spotifyPresence.channelWebhookTOKEN) {
              _spotifyPresence.channelWebhookID = webhookfind.id
              _spotifyPresence.channelWebhookTOKEN = webhookfind.token
              _modelfetch.save()
          }
        }
      
        try {
            await interaction.reply({ content })
        } catch (err) {
            await interaction.channel.send({ content })
        }
      
        await Models.guilds.updateOne({ guildId: channel?.guildId || interaction?.guildId }, {
            $push: {
                transactions: {
                    id: await randomId(18),
                    ownerId: interaction.member.id,
                    date: await localTime("DD MMMM YYYY HH.mm.ss"),
                    name: "Spotify bilgilendirme sisteminde değişiklik yapıldı.",
                    oldValue: IsItWorking == "enable" ? "açık" : "kapalı",
                    newValue: IsItWorking == "enable" ? "kapalı" : "açık"
                }
            }
        }, { upsert: true }).catch(err => console.log(err))
    }
}