const { client, config, swearBlocker, Models } = require("../server")
const { MessageEmbed, Permissions, Modal } = require("discord.js")

module.exports = {
    name: "server",
    run: async (client, interaction) => {
        let modelfetch = await Models.guilds.findOne({ guildId: interaction?.guildId })
        if (!modelfetch) return await interaction.editReply({ content: '> Sunucu hakkında hiçbir veriye ulaşılamadı.', ephemeral: true })
      
        if (interaction?.values[0] == "settings") {
            let settings = modelfetch.settings
            if (!settings) return await interaction.editReply({ content: '> Sunucu hakkında hiçbir veriye ulaşılamadı.', ephemeral: true })

            let adchannelBlock = settings?.adBlocker?.channels
            let swearchannelBlock = settings?.swearBlocker?.channels
            let spotifyPresence = settings?.spotifyPresence
            let loginInfo = settings?.loginInfo
            let logoutInfo = settings?.logoutInfo

            let embed = new MessageEmbed().setColor(config.color)
                .setTitle(`Sunucudaki ayarlar:`)
                .setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })
                .addFields(
                    { 
                      name: 'Kötü söz engelleme:', 
                      value: `${adchannelBlock[0] ? "_Bu özellik açıktır._ \nEngellenen kanallar: " + adchannelBlock.map(m => `<#${m}>`) : "_Bu özellik kapalıdır._" }`
                    },
                    { 
                      name: 'Reklam engelleme:', 
                      value: `${swearchannelBlock[0] ? "_Bu özellik açıktır._ \nEngellenen kanallar: " + swearchannelBlock.map(m => `<#${m}>`) : "_Bu özellik kapalıdır._" }`
                    },
                    { 
                      name: 'Spotify müzik bilgilendirme:', 
                      value: spotifyPresence.status == "enable" ? `_Bu özellik açıktır._ \nBilgilendirme <#${spotifyPresence.channelId}> kanalından yapılmaktadır.` : "_Bu özellik kapalıdır._"
                    },
                    { 
                      name: 'Kullanıcı giriş bilgilendirme:',
                      value: loginInfo.status == "enable" ? `_Bu özellik açıktır._ \nBilgilendirme <#${loginInfo.channelId}> kanalından yapılmaktadır.` : "_Bu özellik kapalıdır._"
                    },
                    { 
                      name: 'Kullanıcı çıkış bilgilendirme:',
                      value: logoutInfo.status == "enable" ? `_Bu özellik açıktır._ \nBilgilendirme <#${logoutInfo.channelId}> kanalından yapılmaktadır.` : "_Bu özellik kapalıdır._"
                    },
                )
            return await interaction.editReply({ embeds: [embed], components: [], ephemeral: true })
        }
        /*// Bir kod nasıl çalışmaz oynat bakalım.
        if (interaction?.values[0] == "transactions") {
            let transactions = modelfetch.transactions
            if (!transactions) return await interaction.editReply({ content: '> Sunucuda hiçbir işlem verisine ulaşılamadı.', ephemeral: true })
          
            let text = transactions[0] ? Array(transactions).map(t => { 
              `İşlem Adı: ` + t.name + ` \n` + 
              `İşlem tarihi: ` + t.date + ` \n` + 
              `İşlemi yapan: ` + t.ownerId + ` \n`  + 
              `Eklenen veri: ` + t.newValue == "açık" || t.newValue == "kapalı" ? t.newValue : `<#${t.addedValue ? t.addedValue : t.removedValue}>` 
            }).join('\n ') : "Herhangi bir işlem bulunamadı."
            
            console.log(transactions.reverse().slice(0,1).map(t => t.name))
          
            let embed = new MessageEmbed().setColor(config.color)
                .setTitle(`Sunucudaki işlemler:`)
                .setDescription(text)
                .setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })
            return await interaction.editReply({ embeds: [embed], components: [], ephemeral: true })
        }
        */
        return interaction.editReply({ content: "😕 Seçim yaptığınız menüdeki seçenek artık menüde bulunmamaktadır.", components: [], ephemeral: true })
    }
}
