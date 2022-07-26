const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, Colors } = require("discord.js")
const { Models } = require("../server")

module.exports = {
    name: "confirmedRegister",
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

        let data = interaction.message.embeds[0].description.split("> ").map(m => m.replace("\n", "")).filter(f => f.slice(1))
        let upper = (text) => text.slice(0, 1).toUpperCase() + text.slice(1, 550).toLowerCase()
        
        let user = {
            discordId: data[0].slice(data[0].search("Discord ID:") + 12, 40),
            name: upper(data[1].slice(data[1].search("Adı:") + 5, 30)),
            familyName: data[2].slice(10) ? upper(data[2].slice(data[2].search("Soyadı:") + 8, 50)) : null,
            age: data[3].slice(data[3].search("Yaşı:") + 6, 10),
            gender: data[4].slice(15) ? data[4].slice(data[4].search("Cinsiyeti:") + 11, 60) : null,
            sentences: data[5].slice(25) ? data[5].slice(data[5].search("Hakkında:") + 10, 600) : null
        }

        let reasonChannelValue = interaction.message.embeds[0].fields.filter(f => f.name == `Teyit yapılacak kanal:`)[0]?.value
        let reasonChannelId = reasonChannelValue?.replace("<#", "").replace(">","")
        let reasonChannel = client.channels.cache.get(reasonChannelId)

        let guild = client.guilds.cache.get(interaction.guildId)
        let User = guild.members.cache.get(user.discordId)

        await reasonChannel.delete().then(() => {
            let embed = {
                color: Colors.DarkPurple,
                footer: interaction.message.embeds[0].footer,
                title: `${User.user.username} adlı kullanıcının sesli kanalda teyit işlemi tamamlandı.`,
                description: interaction.message.embeds[0].description,
                fields: [
                    { name: `İşlem yapan yönetici:`, value: `<@${interaction.member.user.id}> \`${interaction.member.user.id}\`` },
                    { name: `Yapılan işlemler:`, value: `Sesli kanalda kullanıcı teyit edildi.` }
                ]
            }

            let confirmed = new ButtonBuilder().setCustomId('directRegister')
                .setLabel('✅ Bilgiler doğru, kayıt et').setStyle('Success')
            let manuelRegister = new ButtonBuilder().setCustomId('manuelRegister')
                .setLabel('✅ Manuel kayıt et').setStyle('Primary')
            let cancelRegister = new ButtonBuilder().setCustomId('cancelRegister')
                .setLabel('❎ Kayıt İşlemini Kapat').setStyle('Danger')
            let blockRegister = new ButtonBuilder().setCustomId('blockRegister')
                .setLabel('❎ Kullanıcıyı Engelle').setStyle('Danger')

            let registerButtons = new ActionRowBuilder().addComponents(confirmed, manuelRegister, cancelRegister, blockRegister)

            return interaction.editReply({ embeds: [embed], components: [registerButtons] }).catch((e) => null)
        }).catch((e) => null)
    }
}