const { TextInputBuilder, ModalBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField } = require("discord.js")
const { Models } = require("../server")

module.exports = {
    name: "cancelRegister",
    run: async (client, interaction) => {
        let modelfetch = await Models.guilds.findOne({ guildId: interaction?.guildId })
        let registerSystem = modelfetch.settings?.registerSystem
        if (registerSystem?.status == "disable")
            return interaction.reply({ content: "Kayıt sistemi şuanda kapalı durumdadır.", ephemeral: true }).catch((e) => null)

        let Flags = PermissionsBitField.Flags
        let funcAdminValue = interaction.message.embeds[0].fields.filter(f => f.name == `İşlem yapan yönetici:`)[0]?.value
        let funcAdminId = funcAdminValue?.slice(funcAdminValue.search("`") + 1, funcAdminValue.search("`") + 19)

        if (funcAdminId !== interaction.member.user.id || !interaction.member.permissions.has(Flags["Administrator"]))
            return interaction.reply({ content: "İşlemin yöneticisi veya sunucu yöneticisi değilsiniz.", ephemeral: true })
                .catch((e) => null)

        const reason = new TextInputBuilder()
            .setMaxLength(500).setMinLength(20).setRequired(true)
            .setCustomId('reason')
            .setLabel("Yönetici olarak bir sebep belirtmelisiniz.")
            .setStyle(TextInputStyle.Paragraph)

        const reasonActionRow = new ActionRowBuilder().addComponents(reason)

        const modal = new ModalBuilder().setCustomId('cancelRegisterReason')
            .setTitle(`Kayıt İşleminin İptal Edilmesi`)
            .addComponents(reasonActionRow)

        return await interaction.showModal(modal).catch((e) => null)
    }
}