const { ApplicationCommandType, SelectMenuBuilder, EmbedBuilder, ActionRowBuilder } = require("discord.js")
const { config } = require("../server")

module.exports = {
    type: ApplicationCommandType.ChatInput,
    authorityLevel: "members",
    name: "yardım",
    description: "Discord botuna ait yardım menüsünü gösterir.",
    run: async (client, interaction, args) => {
        const menu = new SelectMenuBuilder().setCustomId('help').setPlaceholder('Görmek istediğinizi seçiniz.')
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

        const row = new ActionRowBuilder().addComponents(menu)
        let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
            .setDescription(`Hangi konuda yardım almak istediğinizi seçiniz.`)
        return await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
    }
}