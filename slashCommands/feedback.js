const { MessageEmbed, MessageButton, MessageActionRow, Modal, TextInputComponent } = require("discord.js")
const { client, config, localTime } = require("../server")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "members",
    name: "geri-bildirim",
    description: "Discord botu hakkında geri bildirim göndermenizi sağlar.",
    run: async (client, interaction, args) => {
        const modal = new Modal().setCustomId('feedback').setTitle('Geri Bildirim')

        const feedback_descriptionInput = new TextInputComponent()
            .setCustomId('feedback_description')
            .setLabel("Lütfen bildirmek istediğiniz konuyu yazınız.")
            .setStyle('PARAGRAPH')

        const secondActionRow = new MessageActionRow().addComponents(feedback_descriptionInput)

        modal.addComponents(secondActionRow)

        await interaction.showModal(modal)
    }
}
