const { config } = require("../server")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    name: "help",
    run: async (client, interaction) => {
        let commandsEmbed = async (filter) => new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
            .setImage(config.embedAnimateBar)
            .setDescription(`${client.slashCommands.filter(f => f.authorityLevel == filter).map(m => `\`/${m.name}\` - ${m.description}`).join(' \n')}`)
            .setTitle(
                filter == "administrator" ? `Sunucu yöneticilerinin komutları:` :
                    filter == "message-manager" ? `Mesajları yönetebilenlerin komutları:` :
                        filter == "members" ? `Herkes tarafından kullanılabilen komutlar:` :
                            `${client.user.username}`
            )

        if (interaction?.values[0] == "administrator-commands")
            return await interaction.editReply({ embeds: [await commandsEmbed("administrator")], ephemeral: true })

        if (interaction?.values[0] == "message-manager-commands")
            return await interaction.editReply({ embeds: [await commandsEmbed("message-manager")], ephemeral: true })

        if (interaction?.values[0] == "members-commands")
            return await interaction.editReply({ embeds: [await commandsEmbed("members")], ephemeral: true })

        if (interaction?.values[0] == "close-menu")
            return await interaction.editReply({ content: "Yardım Menüsünü Kapattım.", embeds: [], components: [], ephemeral: true })

        return interaction.editReply({ content: "😕 Seçim yaptığınız menüdeki seçenek artık menüde bulunmamaktadır.", components: [], ephemeral: true })
    }
}
