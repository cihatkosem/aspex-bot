const { ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, PermissionsBitField } = require("discord.js")
const { Models } = require("../server")

module.exports = {
    name: "manuelRegister",
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

        const name = new TextInputBuilder().setCustomId('name')
            .setStyle(TextInputStyle.Short).setMaxLength(15).setMinLength(3)
            .setLabel("Kullanıcının adını yazınız.").setRequired(true)

        const age = new TextInputBuilder().setCustomId('age')
            .setStyle(TextInputStyle.Short).setMaxLength(2).setMinLength(1)
            .setLabel("Kullanıcının yaşını yazınız.").setRequired(true)

        const gender = new TextInputBuilder().setCustomId('gender')
            .setStyle(TextInputStyle.Short).setMaxLength(5).setMinLength(3)
            .setLabel("Kullanıcının cinsiyetini yazınız.").setRequired(true)

        const nameActionRow = new ActionRowBuilder().addComponents(name)
        const ageActionRow = new ActionRowBuilder().addComponents(age)
        const genderActionRow = new ActionRowBuilder().addComponents(gender)

        const modal = new ModalBuilder().setCustomId('manuelRegister')
            .setTitle(`Manuel Kayıt Etme Sistemi`)
            .addComponents(nameActionRow, ageActionRow, genderActionRow)

        return await interaction.showModal(modal).catch((e) => null)
    }
}