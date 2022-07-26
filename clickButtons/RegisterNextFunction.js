const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, Colors } = require("discord.js")
const { Models } = require("../server")

module.exports = {
    name: "nextRegisterFunction",
    run: async (client, interaction) => {
        let modelfetch = await Models.guilds.findOne({ guildId: interaction?.guildId })
        let registerSystem = modelfetch.settings?.registerSystem
        if (registerSystem?.status == "disable")
            return interaction.reply({ content: "Kayıt sistemi şuanda kapalı durumdadır.", ephemeral: true }).catch((e) => null)

        let data = interaction.message.embeds[0].description.split("> ").map(m => m.replace("\n", "")).filter(f => f.slice(1))
        let upper = (text) => text.slice(0, 1).toUpperCase() + text.slice(1, 550).toLowerCase()

        let user = {
            discordId: data[0].slice(data[0].search("Discord ID:") + 12, 40),
            name: upper(data[1].slice(data[1].search("Adı:") + 5, 30)),
            familyName: data[2].slice(10) ? upper(data[2].slice(data[2].search("Soyadı:") + 8, 50)) : null,
            age: data[3].slice(data[3].search("Yaşı:") + 6, 10),
            gender: data[4].slice(15) ? data[4].slice(data[4].search("Cinsiyeti:") + 11, 60) : null,
            sentences: data[5].slice(25) ? data[5].slice(data[5].search("Hakkında:") + 10, 600) : null
        }

        let guild = client.guilds.cache.get(interaction.guildId)
        let User = guild.members.cache.get(user.discordId)

        let Flags = PermissionsBitField.Flags

        let channel = await interaction.guild.channels.create({
            name: `${User.user.tag}`,
            type: ChannelType.GuildVoice,
            parent: interaction.channel.parent,
            permissionOverwrites: [
                { id: user.discordId, allow: [Flags.Connect, Flags.Speak] },
                { id: interaction.user.id, allow: [Flags.Connect, Flags.Speak] },
                { id: interaction.guild.roles.everyone.id, dany: [Flags.Connect, Flags.Speak] }
            ]
        }).then(channel => new Promise((resolve) => resolve(channel)))
        
        let embed = {
            color: Colors.DarkPurple,
            footer: interaction.message.embeds[0].footer,
            title: `${User.user.username} adlı kullanıcının sesli kanalda teyit işlemi yapılacaktır.`,
            description: interaction.message.embeds[0].description,
            fields: [
                { name: `İşlem yapan yönetici:`, value: `<@${interaction.member.user.id}> \`${interaction.member.user.id}\`` },
                { name: `Teyit yapılacak kanal:`, value: `<#${channel.id}>` }
            ]
        }

        let confirmed = new ButtonBuilder().setCustomId('confirmedRegister')
            .setLabel('✅ Teyit işlemi tamamlandı').setStyle('Success')
        let cancelRegister = new ButtonBuilder().setCustomId('cancelRegister')
            .setLabel('❎ Kayıt İşlemini Kapat').setStyle('Danger')
        let blockRegister = new ButtonBuilder().setCustomId('blockRegister')
            .setLabel('❎ Kullanıcıyı Engelle').setStyle('Danger')

        let registerButtons = new ActionRowBuilder().addComponents(confirmed, cancelRegister, blockRegister)

        let UserInfoContent = `**${interaction.guild.name}** sunucusunda kayıt işleminizde sonraki adıma geçildi. \n` +
                                `Lütfen sesli teyit işlemi için <#${channel.id}> kanalına bağlanınız.`
        await User.send({ content: UserInfoContent }).catch((e) => null)

        return await interaction.editReply({ embeds: [embed], components: [registerButtons] })
    }
}