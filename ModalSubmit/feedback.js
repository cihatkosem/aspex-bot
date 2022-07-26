const { EmbedBuilder } = require("discord.js")
const { config, swearBlocker } = require("../server")

module.exports = {
    name: "feedback",
    run: async (client, interaction) => {
        const description = interaction.fields.getTextInputValue('description')
        let check = swearBlocker(description)
        if (check == true) return;

        await interaction.reply({ content: 'Teşekkürler, geri bildiriminiz başarıyla gönderildi!', ephemeral: true });
        let channel = client.guilds.cache.get("939976041932398692").channels.cache.get("986941238232104990")
        let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
            .setAuthor({ name: interaction.member.user.username, iconURL: interaction.member.user.displayAvatarURL() })
            .setDescription(
                `> Gönderen: ${interaction.member} \n` +
                `> Hakkında detaylı bilgi [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${interaction.member.id}) \n` +
                `\`\`\`${description}\`\`\``
            )
            .setTimestamp()

        return await channel.send({ embeds: [embed] })
    }
}