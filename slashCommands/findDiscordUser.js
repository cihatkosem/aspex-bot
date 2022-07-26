const { ApplicationCommandType, ApplicationCommandOptionType,EmbedBuilder } = require("discord.js")
const { config } = require("../server")
const axios = require("axios")

module.exports = {
    type: ApplicationCommandType.ChatInput,
    authorityLevel: "members",
    name: "discord",
    description: "Belirttiğiniz kullanıcı id'si ile kullanıcının genel bilgilerini öğrenebilirsiniz.",
    options: [
        {
            name: "id",
            description: "Kullanıcı id'si ile kullanıcı araması yapılır.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    run: async (client, interaction, args) => {
        if (!interaction) return;
        let id = interaction.options.getString("id")
        let api = await axios.get(`https://drizzlydeveloper.xyz/api/discord/users/${id ? id : interaction.member.id}`)
        let user = api?.data?.data ? api?.data?.data : null
        if (!user) return interaction.reply({ content: "Profil bulunamadı! _Api kullanıldığı için kullanım limiti dolmuş olabilir_", ephemeral: true })

        let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
            .setAuthor({ name: user.username, iconURL: user.avatarURL ? user.avatarURL + "?size=4096" : "" })
            .setDescription(
                '**Oluşturulma Tarihi: **' + user.createdAt + "\n" +
                '**Bot mu?: **' + `${user.bot == "yes" ? "evet" : user.bot == "verified" ? "Evet, doğrulanmış bir bot." : "hayır"}` + "\n" +
                `${user.flags[0] ? `**Bayraklar: **\n${user.flags.map(m => `${m.name}\n`)}` : ""}` +
                `[Discord'da görüntülemek için tıkla.](https://discord.com/users/${user.id}) \n` +
                `[Api olarak görüntülemek için tıkla.](http://drizzlydeveloper.xyz/api/discord/users/${user.id})`
            )
            .setThumbnail(user.avatarURL ? user.avatarURL + "?size=4096" : "")
            .setImage(user.bannerURL ? user.bannerURL + "?size=4096" : "")

        interaction.reply({ embeds: [embed], ephemeral: true })
        return;
    }
}
