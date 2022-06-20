const { MessageEmbed } = require("discord.js")
const { client, config, localTime, instagramUser } = require("../server")
const axios = require("axios")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "members",
    name: "instagram",
    description: "Belirttiğiniz kullanıcı adı ile kullanıcının Istagram'daki bilgilerini öğrenebilirsiniz.",
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
        let user = instagramUser(username ? username : interaction.member.user.username)
        if (!user) return interaction.reply({ content: "Profil bulunamadı! _Api kullanıldığı için kullanım limiti dolmuş olabilir_", ephemeral: true })
        let embed = new MessageEmbed()
            .setColor(config.color)
            .setDescription(
              `Kullanıcı adı: ${user.username} \n` +
              `Bu hesap ${user.verified && user.verified == true ? "doğrulanmıştır." : "doğrulanmamıştır."} \n` +
              `Bu hesap ${user.private && user.private == true ? "herkese açıktır." : "gizlidir."} \n` +
              `Biyografi: ${user.biography ? user.biography : "_biyografide bir şey yazmamaktadır._"} \n` +
              `Takipçi sayısı: ${user.followers ? user.followers : "0"} \n` +
              `Takip ettiği kişi sayısı: ${user.following ? user.following : "0"} \n` +
              `[instagram.com/${user.username}](https://instagram.com/${user.username})`
            )
            .setThumbnail(user.picture ? user.picture : "")
            .setTimestamp().setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })

        interaction.reply({ embeds: [embed], ephemeral: true })
    }
}
