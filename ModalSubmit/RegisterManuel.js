const { Colors } = require("discord.js")
const { Models } = require("../server")

module.exports = {
    name: "manuelRegister",
    run: async (client, interaction) => {
        let modelfetch = await Models.guilds.findOne({ guildId: interaction?.guildId })
        let registerSystem = modelfetch.settings?.registerSystem
        let findInput = (value) => interaction.fields.getTextInputValue(value)
        let data = interaction.message.embeds[0].description.split("> ").map(m => m.replace("\n", "")).filter(f => f.slice(1))
        let upper = (text) => text.slice(0, 1).toUpperCase() + text.slice(1, 550).toLowerCase()

        let user = {
            discordId: data[0].slice(data[0].search("Discord ID:") + 12, 40),
            name: upper(findInput('name')),
            age: findInput('age'),
            gender: findInput('gender')
        }

        let guild = client.guilds.cache.get(interaction.guildId)
        let User = guild.members.cache.get(user.discordId)
        let nickName = `${user.name} / ${user.age}`

        let embed = {
            color: Colors.DarkPurple,
            footer: interaction.message.embeds[0].footer,
            title: `${User.user.username} adlı kullanıcı manuel olarak kayıt edildi.`,
            description: interaction.message.embeds[0].description,
            fields: [
                { name: `İşlem yapan yönetici:`, value: `<@${interaction.member.user.id}> \`${interaction.member.user.id}\`` },
                { name: `İşlem sonrasın kullanıcı adı:`, value: `<@${user.discordId}> \`${nickName}\`` }
            ]
        }
        let memberRoleId = user.gender.toLowerCase() == "erkek" ? registerSystem.newManRoleId :
            user.gender.toLowerCase() == "kadın" ? registerSystem.newWomanRoleId : null

        if (!memberRoleId)
            return interaction.reply({
                content: "Sayın yönetici; \n" +
                    "Kullanıcının cinsiyeti eksik veya hatalı yazıldığınız için işlemi gerçekleştiremiyorum. \n" +
                    "Lütfen sadece `Erkek` veya `Kadın` yazınız.",
                ephemeral: true
            }).catch((e) => null)

        await User.roles.add(memberRoleId).catch((e) => null)
        await User.setNickname(nickName).catch((e) => null)

        let content = `**${interaction.guild.name}** sunucusunda kayıt işleminiz manuel olarak tamamlandı. \n` +
            `(Manuel Kayıt, adınızı veya yaşınızı doğru biçimde yazmadığınız zaman uygulanır.)`
        await User.send({ content }).catch((e) => null)

        return await interaction.editReply({ embeds: [embed], components: [] }).catch((e) => null)
    }
}