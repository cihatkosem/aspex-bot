const { Colors } = require("discord.js")
const { config, Models } = require("../server")
module.exports = {
    name: "directRegister",
    run: async (client, interaction) => {
        let modelfetch = await Models.guilds.findOne({ guildId: interaction?.guildId })
        let registerSystem = modelfetch.settings?.registerSystem
        if (registerSystem?.status == "disable")
            return interaction.reply({ content: "Kayıt sistemi şuanda kapalı durumdadır.", ephemeral: true }).catch((e) => null)

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

        let memberRoleId = user.gender.toLowerCase() == "erkek" ? registerSystem.newManRoleId :
            user.gender.toLowerCase() == "kadın" ? registerSystem.newWomanRoleId : null
        let nickName = `${user.name} / ${user.age}`
        let guild = client.guilds.cache.get(interaction.guildId)
        let User = guild.members.cache.get(user.discordId)

        if (!memberRoleId)
            return interaction.reply({
                content: "Kullanıcının cinsiyeti eksik veya hatalı yazıldığı için manuel kayıt yapmanız gerekiyor.",
                ephemeral: true
            }).catch((e) => null)

        await User.setNickname(nickName).catch((e) => null)
        await User.roles.add(memberRoleId).catch((e) => null)

        let embed = {
            color: Colors.DarkPurple,
            footer: interaction.message.embeds[0].footer,
            title: `${User.user.username} adlı kullanıcı yazdığı bilgileri ile direk kayıt edildi.`,
            description: interaction.message.embeds[0].description,
            fields: interaction.message.embeds[0].fields
        }

        return await interaction.editReply({ embeds: [embed], components: [] }).catch((e) => null)
    }
}