const { localTime, Models, config } = require("../server")
const { MessageEmbed } = require("discord.js")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "administrator",
    name: "mesaj-ekle",
    description: "Sunucunuzda yazılan mesaja özel cevap ekleyebilirsiniz.",
    options: [
        {
            name: "nasıl_kullanılsın",
            description: "Mesajın nasıl kullanılabileceğini seçiniz.",
            type: "STRING",
            required: true,
            choices: [
                { name: "prefix olmadan", value: "message-noprefix" }
            ]
        },
        {
            name: "gelen_mesaj",
            description: "Kullanıcının cevaplanacak olan mesajını yazınız.",
            type: "STRING",
            required: true,
        },
        {
            name: "gelen_mesaj_engellensin_mi",
            description: "Gelen mesaj sunucunuzda istenmiyorsa eğer engelleyebiliriz. Lütfen bunu seçiniz.",
            type: "STRING",
            required: true,
            choices: [
                { name: "evet", value: "message-blocked" },
                { name: "hayır", value: "message-noblocked" }
            ]
        },
        {
            name: "gönderilecek_mesaj",
            description: "Botun gelen mesaja göndereceği mesajı yazınız.",
            type: "STRING",
            required: true,
        },
    ],
    run: async (client, interaction, args) => {
        if (!interaction) return;
        let howToUse = interaction.options.getString("nasıl_kullanılsın")
        let inComingMessage = interaction.options.getString("gelen_mesaj")
        let isBlock = interaction.options.getString("gelen_mesaj_engellensin_mi")
        let outGoingMessage = interaction.options.getString("gönderilecek_mesaj")

        let prefix = howToUse == "message-noprefix" ? false : howToUse == "message-withprefix" ? true : null
        let block = isBlock == "message-blocked" ? true : isBlock == "message-noblocked" ? false : null
        let receivedMessage = inComingMessage.toLowerCase()
        let sendMessage = outGoingMessage

        if (receivedMessage.toLowerCase() == sendMessage.toLowerCase())
            return interaction.reply({ content: `Yazılan metin ile gönderilecek olan metin aynı olamaz!` })

        let findServer = await Models.guilds.findOne({ guildId: interaction?.guildId })
        let findText = findServer.messages.filter(f => f.receivedMessage == receivedMessage)[0]

        if (findText) return interaction.reply({ content: `Bu yazı daha önceden kaydedilmiş, değiştirmek için önce silmelisin!` })

        return await Models.guilds.updateOne({ guildId: interaction?.guildId }, {
            $push: {
                messages: {
                    ownerId: interaction.member.id,
                    date: await localTime("DD MMMM YYYY HH.mm.ss"),
                    prefix, block, receivedMessage, sendMessage
                }
            }
        }, { upsert: true })
            .then(() => {
                let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
                    .setDescription(
                        `> ** Sunucuya Özel Mesaja Cevap Başarıyla Eklendi.**\n` +
                        `> Bu mesajı oluşturan: <@${interaction.member.id}> _[${interaction.member.id}](http://drizzlydeveloper.xyz/api/discord/users/${interaction.member.id})_ \n` +
                        `> Cevap verilecek olan mesaj: \`${receivedMessage}\` \n` +
                        `> Cevap mesajı: \`${sendMessage}\``
                    )

                interaction.reply({ embeds: [embed] })
            }).catch((err) => interaction.reply({ content: `İsteğinizi gerçekleştirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.` }))
        return;
    }
}
