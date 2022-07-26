const { ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle } = require("discord.js")
const { Models } = require("../server")

module.exports = {
    name: "register",
    run: async (client, interaction) => {
        let modelfetch = await Models.guilds.findOne({ guildId: interaction?.guildId })
        let registerSystem = modelfetch.settings?.registerSystem
        if (registerSystem?.status == "disable")
            return interaction.reply({ content: "Kayıt sistemi şuanda kapalı durumdadır.", ephemeral: true }).catch((e) => null)

        const name = new TextInputBuilder()
            .setStyle(TextInputStyle.Short).setMaxLength(15).setMinLength(3).setRequired(true)
            .setCustomId('name').setLabel("Adınızı yazınız.")

        const familyName = new TextInputBuilder()
            .setStyle(TextInputStyle.Short).setMaxLength(20).setMinLength(2).setRequired(false)
            .setCustomId('familyName').setLabel("Soyadınızı yazınız.").setPlaceholder("Zorunlu değil.")

        const age = new TextInputBuilder()
            .setStyle(TextInputStyle.Short).setMaxLength(2).setMinLength(1).setRequired(true)
            .setCustomId('age').setLabel("Yaşınızı yazınız.")

        const gender = new TextInputBuilder()
            .setStyle(TextInputStyle.Short).setMaxLength(5).setMinLength(3).setRequired(true)
            .setCustomId('gender').setLabel("Cinsiyetinizi yazınız.")
            .setPlaceholder("Erkek veya Kadın şekinde yazınız.")

        const sentences = new TextInputBuilder()
            .setMaxLength(500).setMinLength(30).setRequired(false)
            .setCustomId('sentences')
            .setPlaceholder("Zorunlu değil.")
            .setLabel("Söylemek istedikleriniz yazabilirsiniz.")
            .setStyle(TextInputStyle.Paragraph)

        const nameActionRow = new ActionRowBuilder().addComponents(name)
        const familyNameActionRow = new ActionRowBuilder().addComponents(familyName)
        const ageActionRow = new ActionRowBuilder().addComponents(age)
        const genderActionRow = new ActionRowBuilder().addComponents(gender)
        const sentencesActionRow = new ActionRowBuilder().addComponents(sentences)

        const modal = new ModalBuilder().setCustomId('register')
            .setTitle(`Kullanıcı Kayıt Olma Sistemi`)
            .addComponents(nameActionRow, familyNameActionRow, ageActionRow, genderActionRow, sentencesActionRow)

        if (interaction.member.nickname?.slice(0, 1) == "!")
            return interaction.reply({ content: "Kayıt işleminiz engellendiği için kayıt olamazsınız.", ephemeral: true }).catch((e) => null)

        if (interaction.member.nickname?.slice(0, 1) == "~")
            return interaction.reply({ content: "Kayıt işlemininiz daha önceden başlatılmış.", ephemeral: true }).catch((e) => null)

        return await interaction.showModal(modal).catch((e) => null)
    }
}