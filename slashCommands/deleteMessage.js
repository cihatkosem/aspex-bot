const { MessageEmbed, Permissions } = require("discord.js")
const { client, config, localTime } = require("../server")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "message-manager",
    name: "temizle",
    description: "Mesajları temizlemek için kullanılır.",
    options: [
        {
            name: "miktar",
            description: "Belirttiğiniz miktarda mesaj silinir.",
            type: "NUMBER",
            required: true,
        },
    ],
    run: async (client, interaction, args) => {
        if (!interaction) return;
        let quantity = interaction.options.getNumber("miktar")
        
        await interaction.channel.bulkDelete(quantity >= 100 ? 100 : quantity, true).then(async (deleted) => {
            if (deleted <= 0) return await interaction.reply({ content: "2 hafta öncesindeki mesajları silemem.", ephemeral: true })
          
            let limiting = "Tek seferde en fazla 100 mesaj silinebilir."
            let txt = `${quantity > 100 && deleted.size == 100 ? `\n ${limiting}` + `\n Buyüzden fazla gelen ${quantity - 100} mesaj silinemedi.` : ""}`
            
            await interaction.reply({ content: `Toplam \`${deleted.size + 1}\` mesajı sildim.` + txt }).catch((err) => { })
            setTimeout(async () => await interaction.deleteReply().catch((err) => { }), 7000)
        })
    }
}
