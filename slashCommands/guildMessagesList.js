const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js")
const { config, Models } = require("../server")

module.exports = {
    type: ApplicationCommandType.ChatInput,
    authorityLevel: "administrator",
    name: "mesajlar",
    description: "Sunucunuzda yazılan özel cevap verilen mesaj hakkında detayları görebilirsin.",
    options: [
        {
            name: "mesaj",
            description: "Hangi mesaj hakkında detaylı bilgiyi görmek istiyorsunuz?",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    run: async (client, interaction, args) => {
        if (!interaction) return;
        let message = interaction.options.getString("mesaj")
        let guildData = await Models.guilds.findOne({ guildId: interaction?.guildId })

        if (message) {
            let messagesFilter = guildData.messages?.filter(f => f.receivedMessage == message.toLowerCase())[0]
            if (!messagesFilter) return interaction.reply({ content: `Belirttiğiniz mesaja özel bir cevap bulunmuyor.`, ephemeral: true })
            let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> ** Sunucuya Özel Mesaja Cevap - ${messagesFilter.receivedMessage}**\n` +
                    `> Bu mesajı oluşturan: <@${messagesFilter.ownerId}> _[${messagesFilter.ownerId}](http://drizzlydeveloper.xyz/api/discord/users/${messagesFilter.ownerId})_ \n` +
                    `> Oluşturulma tarihi: - ${messagesFilter.date} \n` +
                    `> Mesaj alındıktan sonra silinecek mi? ${messagesFilter.block == false ? "- hayır, silinmeyecek." : "- evet, silinecek."} \n` +
                    `> Ön ek (prefix) ile mi kullanılıyor? ${messagesFilter.prefix == false ? "- hayır." : "- evet."} \n\n` +
                    `> Cevap verilecek olan mesaj: \`${messagesFilter.receivedMessage}\` \n` +
                    `> Cevap mesajı: \`${messagesFilter.sendMessage}\``
                )

            interaction.reply({ embeds: [embed] })
        }

        let embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(
                guildData.messages[0] ?
                    guildData.messages.map(m => `> ${m.receivedMessage} : ${m.sendMessage}`).join(" \n") :
                    "🤔 Hata: Hiç işlem bulunamadı."
            )
            .setTimestamp().setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })

        interaction.reply({ embeds: [embed] })
        return;
    }
}
