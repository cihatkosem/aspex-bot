const { ApplicationCommandType, ActionRowBuilder, ModalBuilder, TextInputBuilder } = require("discord.js")

module.exports = {
    type: ApplicationCommandType.ChatInput,
    authorityLevel: "members",
    name: "geri-bildirim",
    description: "Discord botu hakkında geri bildirim göndermenizi sağlar.",
    run: async (client, interaction, args) => {
        const description = new TextInputBuilder()
            .setMaxLength(500).setMinLength(100).setRequired(true)
            .setCustomId('description')
            .setLabel("Lütfen bildirmek istediğiniz konuyu yazınız.")
            .setStyle('PARAGRAPH')

        const secondActionRow = new ActionRowBuilder().addComponents(description)

        const modal = new ModalBuilder().setCustomId('feedback')
            .setTitle('Geri Bildirim')
            .addComponents(secondActionRow)

        return await interaction.showModal(modal)
    }
}
