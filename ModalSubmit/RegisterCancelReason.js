module.exports = {
    name: "cancelRegisterReason",
    run: async (client, interaction) => {
        let reason = interaction.fields.getTextInputValue('reason')
        let data = interaction.message.embeds[0].description.split("> ").map(m => m.replace("\n", "")).filter(f => f.slice(1))
        let upper = (text) => text.slice(0, 1).toUpperCase() + text.slice(1, 550).toLowerCase()

        let user = {
            discordId: data[0].slice(data[0].search("Discord ID:") + 12, 40),
            name: upper(data[1].slice(data[1].search("Adı:") + 5, 30)),
            familyName: data[2].slice(10) ? upper(data[2].slice(data[2].search("Soyadı:") + 8, 50)) : null,
            age: data[3].slice(data[3].search("Yaşı:") + 6, 10),
            sentences: data[4].slice(25) ? data[4].slice(data[4].search("Hakkında:") + 10, 600) : null
        }
        
        let guild = client.guilds.cache.get(interaction.guildId)
        let User = guild.members.cache.get(user.discordId)

        let embed = {
            color: interaction.message.embeds[0].color,
            footer: interaction.message.embeds[0].footer,
            title: `${User.user.username} adlı kullanıcının kayıt işlemi iptal edildi.`,
            description: interaction.message.embeds[0].description,
            fields: [
                { name: `İşlem yapan yönetici:`, value: `<@${interaction.member.user.id}> \`${interaction.member.user.id}\`` },
                { name: `İptal edilme sebebi:`, value: reason }
            ]  
        }

        await User.setNickname(`${User.user.username}`).catch((e) => null)

        let reasonChannelValue = interaction.message.embeds[0].fields.filter(f => f.name == `Teyit yapılacak kanal:`)[0]?.value
        let reasonChannelId = reasonChannelValue?.replace("<#", "").replace(">","")
        let reasonChannel = client.channels.cache.get(reasonChannelId)

        try { await reasonChannel.delete() } catch (e) {}

        let content = `${interaction.guild.name} sunucusunda kayıt işleminiz iptal edildi. ` + 
                        `Tekrar kayıt işlemi başlatabilirsiniz. \n` + `Sebep: \`${reason}\``
        await User.send({ content }).catch((e) => null)
        return await interaction.editReply({ embeds: [embed], components: [] }).catch((e) => null)
    }
}