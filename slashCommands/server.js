const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu, Permissions } = require("discord.js")
const { client, config, localTime } = require("../server")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "administrator",
    name: "sunucu",
    description: "Sunucu hakkında bilgileri gösterir.",
    run: async (client, interaction, args) => {
        const menu = new MessageSelectMenu().setCustomId('server').setPlaceholder('Görmek istediğinizi seçiniz.')
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

        const row = new MessageActionRow().addComponents(menu)
      
        let embed = new MessageEmbed().setColor(config.color)
            .setTimestamp()
            .setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`Sunucuya ait hangi veriye ulaşmak istediğinizi seçiniz.`)
        
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
    }
}
