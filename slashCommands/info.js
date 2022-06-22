const { localTime, config } = require("../server")
const { MessageEmbed } = require("discord.js")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "members",
    name: "bilgi",
    description: "Discord botuna ait bilgileri gösterir.",
    run: async (client, interaction, args) => {
        let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {
                    name: `Ben ${client.user.username},`,
                    value:
                        `> Ping \` ${client.ws.ping} \` \n` +
                        `> Toplam \` ${client.slashCommands.size} \` komutum var. \n` +
                        `> Toplam \` ${client.guilds.cache.size} \` sunucuda bulunuyorum. \n` +
                        `> Toplam \` ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} \` kullanıcıya hizmet veriyorum. \n` +
                        `> Görebildiğim toplam \` ${client.channels.cache.size.toLocaleString()} \` metin kanalı var. \n` +
                        `> Görebildiğim toplam \` ${client.guilds.cache.filter(a => a.voiceStates.cache.size > 0).map(a => a.voiceStates.cache.size).reduce((all, current) => all + current, 0)} \` kişi sesli kanaldadır.`
                },
                {
                    name: `${interaction.guild.name}`,
                    value:
                        `> Sunucunun adı: \` ${interaction.guild.name} \`\n` +
                        `> Sunucunun kurucusu: <@${interaction.guild.ownerId}> \n` +
                        `> Sunucunun oluşturulma tarihi: \` ${await localTime("HH:mm:ss DD/MM/YYYY", interaction.guild.createdAt)} \`\n` +
                        `> Sunucudaki üye sayısı: \` ${interaction.guild.memberCount} \`\n` +
                        `> Sunucudaki kanal sayısı: \` ${interaction.guild.channels.cache.size.toLocaleString()} \``
                },
                {
                    name: `Tarafından istendi:`,
                    value:
                        `> İsteyen kişi: <@${interaction.user.id}> \n` +
                        `> Hesabın oluşturulma tarihi: \` ${await localTime("HH:mm:ss DD/MM/YYYY", interaction.user.createdAt)} \``
                }
            )
        await interaction.reply({ embeds: [embed] })
        return;
    }
}
