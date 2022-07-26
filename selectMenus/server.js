const { Models, config } = require("../server")
const { EmbedBuilder } = require("discord.js")

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

            let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
                .setTitle(`Sunucudaki ayarlar:`)
                .addFields(
                    {
                        name: 'Kötü söz engelleme:',
                        value: `${swearchannelBlock[0] ? "_Bu özellik açıktır._ \nEngellenen kanallar: " + swearchannelBlock.map(m => `<#${m}>`) : "_Bu özellik kapalıdır._"}`
                    },
                    {
                        name: 'Reklam engelleme:',
                        value: `${adchannelBlock[0] ? "_Bu özellik açıktır._ \nEngellenen kanallar: " + adchannelBlock.map(m => `<#${m}>`) : "_Bu özellik kapalıdır._"}`
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
        if (interaction?.values[0] == "transactions") {
            let transactions = modelfetch.transactions
            if (!transactions) return await interaction.editReply({ content: '> Sunucuda hiçbir işlem verisine ulaşılamadı.', ephemeral: true })
            
            let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
                .setTitle(`Sunucudaki işlemler:`)
                .setDescription("Bu özellik çok yakında web site üzerinden hizmet verecektir.")
            return await interaction.editReply({ embeds: [embed], components: [], ephemeral: true })
        }
        
        return interaction.editReply({ content: "😕 Seçim yaptığınız menüdeki seçenek artık menüde bulunmamaktadır.", components: [], ephemeral: true })
    }
}
