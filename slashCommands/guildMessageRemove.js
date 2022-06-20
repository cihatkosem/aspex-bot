const { MessageEmbed } = require("discord.js")
const { client, config, localTime, Models } = require("../server")
const axios = require("axios")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "administrator",
    name: "mesaj-sil",
    description: "Sunucunuzda yazılan mesaja özel cevabı silebilirsiniz.",
    options: [
        {
            name: "silinecek_yazı",
            description: "Cevap verilmesini istemediğiniz yazıyı yazınız.",
            type: "STRING",
            required: true
        }
    ],
    run: async (client, interaction, args) => {
        if (!interaction) return;
        let deletindText = interaction.options.getString("silinecek_yazı")
        await Models.guilds.updateOne(
          { guildId: interaction?.guildId }, 
          { $pull: { messages: { receivedMessage: deletindText } } }, 
          { upsert: true }
        )
        .then(() => {
            return interaction.reply({ content: `Tamamdır artık \`${deletindText}\` yazısına cevap verilmeyecektir.` })
        })
        .catch(err => {
            return interaction.reply({ content: `Hata ile karşılaşıldı. \nBöyle bir yazı bulunamış veya silme işleminde hata olmuş olabilir.` })
        })
      
    }
}
