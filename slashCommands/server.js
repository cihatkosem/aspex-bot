const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require("discord.js")
const { config } = require("../server")

module.exports = {
    type: ApplicationCommandType.ChatInput,
    authorityLevel: "administrator",
    name: "sunucu",
    description: "Sunucu hakkında bilgileri gösterir.",
    run: async (client, interaction, args) => {
        const menu = new SelectMenuBuilder().setCustomId('server').setPlaceholder('Görmek istediğinizi seçiniz.')
            .addOptions([
                {
                    label: 'Ayarlar',
                    description: 'Sunucuda açık veya kapalı olan özellikler listelenir.',
                    value: 'settings',
                },
                /*// Bir kod nasıl çalışmaz oynat bakalım.
                {
                    label: 'İşlemler',
                    description: 'Sunucudaki tüm üyeleri gösterilir.',
                    value: 'transactions',
                }
                */
            ])

        const row = new ActionRowBuilder().addComponents(menu)

        let embed = new EmbedBuilder().setColor(config.color)
            .setTimestamp()
            .setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`Sunucuya ait hangi veriye ulaşmak istediğinizi seçiniz.`)

        return await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
        return;
    }
}
