const axios = require("axios")
const { config } = require("../server")
const { MessageEmbed } = require("discord.js")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "members",
    name: "twitter",
    description: "Belirttiğiniz kullanıcı adı ile kullanıcının Twitter'daki bilgilerini öğrenebilirsiniz.",
    options: [
        {
            name: "username",
            description: "Kullanıcı adı ile kullanıcı araması yapılır.",
            type: "STRING",
            required: false,
        },
    ],
    run: async (client, interaction, args) => {
        if (!interaction) return;
        let username = interaction.options.getString("username")
        let api = await axios.get(`https://drizzlydeveloper.xyz/api/twitter/users/${username ? username : interaction.member.user.username}`)
        let user = api?.data?.data ? api?.data?.data : null
        if (!user) return interaction.reply({ content: "Profil bulunamadı! _Api kullanıldığı için kullanım limiti dolmuş olabilir_", ephemeral: true })

        let desc = user.description ? user.description : null
        let descTR = user.description.tr
        let descORJ = user.description.original
        let description = desc && descORJ ? `${descORJ}${descORJ !== descTR ? `\n_${descTR}_` : ""}\n\n` : null

        let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
            .setAuthor({ name: user.name, iconURL: user.avatar ? user.avatar : "" })
            .setDescription(
                `${desc ? description ? description : "" : ""}` +
                '**Oluşturulma Tarihi: **' + user.created_date + "\n" +
                `${user.location ? '**Lokasyon: **' + user.location + "\n" : ""}` +
                `${user.url ? '**Bağlantı: **' + user.url + "\n" : ""}` +
                '**Twitler: **' + user.tweets + "\n" +
                '**Takip Ettikler: **' + user.followed + "\n" +
                '**Takipçiler: **' + user.followers + "\n\n" +
                `[twitter.com/${user._name}](https://twitter.com/${user._name})`
            )
            .setThumbnail(user.avatar ? user.avatar : "")
            .setImage(user.banner ? user.banner : "")

        interaction.reply({ embeds: [embed], ephemeral: true })
        return;
    }
}
