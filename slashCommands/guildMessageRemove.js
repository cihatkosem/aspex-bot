const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js')
const { Models } = require("../server")

module.exports = {
    type: ApplicationCommandType.ChatInput,
    authorityLevel: "administrator",
    name: "mesaj-sil",
    description: "Sunucunuzda yazılan mesaja özel cevabı silebilirsiniz.",
    options: [
        {
            name: "silinecek_yazı",
            description: "Cevap verilmesini istemediğiniz yazıyı yazınız.",
            type: ApplicationCommandOptionType.String,
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
        .then(() => interaction.reply({ content: `Tamamdır artık \`${deletindText}\` yazısına cevap verilmeyecektir.` }))
        .catch(err => interaction.reply({ 
            content: `Hata ile karşılaşıldı. \nBöyle bir yazı bulunamamış veya silme işleminde hata olmuş olabilir.` 
        }))
        return;
    }
}
