const { MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow } = require("discord.js")
const { client, config, localTime } = require("../server")
module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "members",
    name: "yardım",
    description: "Discord botuna ait yardım menüsünü gösterir.",
    run: async (client, interaction, args) => {
        const menu = new MessageSelectMenu().setCustomId('help').setPlaceholder('Görmek istediğinizi seçiniz.')
            .addOptions([
              {
                label: 'Yetkili komutları',
                description: 'Sunucuda yanlızca yöneticilerin kullanabildiği komutlar listelenir.',
                value: 'administrator-commands',
              },
              {
                label: 'Mesajları yönetebilenlerin komutları',
                description: 'Sunucuda yanlızca mesajları yönetebilenleri kullanabildiği komutlar listelenir.',
                value: 'message-manager-commands',
              },
              {
                label: 'Kullanıcı komutları',
                description: 'Sunucudaki kullanıcıların kullanabildikleri komutlar listelenir.',
                value: 'members-commands',
              },
              {
                label: 'Yardım Menüsünü Kapat',
                description: 'Menüyü kapatak istiyorsanız tıklayınız.',
                value: 'close-menu',
              },
            ])

        const row = new MessageActionRow().addComponents(menu)
      
        let embed = new MessageEmbed().setColor(config.color)
            .setTimestamp()
            .setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`Hangi konuda yardım almak istediğinizi seçiniz.`)
        
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
    }
}