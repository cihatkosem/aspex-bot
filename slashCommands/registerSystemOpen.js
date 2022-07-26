const { 
    ApplicationCommandType, ButtonBuilder, ApplicationCommandOptionType, ActionRowBuilder, ChannelType, Colors
} = require("discord.js")
const { config, Models } = require("../server")

module.exports = {
    type: ApplicationCommandType.ChatInput,
    authorityLevel: "administrator",
    name: "kayıt-sistemini-aç",
    description: "Discord botuna ait yardım menüsünü gösterir.",
    options: [
        {
            name: "first-channel",
            description: "Yeni üyenin görebildiği ilk ve kayıt işlemini yapacağı kanalı seçiniz.",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: "info-channel",
            description: "Yöneticilere bilgi mesajını göndermemiz için bir metin kanalı seçiniz.",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: "new-man-role",
            description: "Yeni kayıt edilen erkek üyeye verilecek olan rölü seçiniz.",
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
        {
            name: "new-woman-role",
            description: "Yeni kayıt edilen kız üyeye verilecek olan rölü seçiniz.",
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
    ],
    run: async (client, interaction, args) => {
        let modelfetch = await Models.guilds.findOne({ guildId: interaction?.guildId })

        let firstChannel = interaction.options.getChannel("first-channel")
        let infoChannel = interaction.options.getChannel("info-channel")
        let newManRole = interaction.options.getRole("new-man-role")
        let newWomanRole = interaction.options.getRole("new-woman-role")

        if (firstChannel.type !== ChannelType.GuildText)
            return await interaction.reply({
                content: `Yeni üyenin görebildiği ilk ve kayıt işlemini yapacağı kanal bir metin kanalı olacak şekilde ayarlanmalıdır.`,
                ephemeral: true
            })

        if (infoChannel.type !== ChannelType.GuildText)
            return await interaction.reply({
                content: `Yöneticilerin bilgilendirileceği kanal bir metin kanalı olacak şekilde ayarlanmalıdır.`,
                ephemeral: true
            })

        if (!modelfetch) {
            await interaction.reply({ content: "Sunucu verisi daha önceden oluşturulmamış, lütfen biraz bekleyin." })
            await Models.functions.guild.create(channel.guildId)

            return asyncsetTimeout(async () => {
                let modelfetch1 = await Models.guilds.findOne({ guildId: channel?.guildId || interaction?.guildId })
                if (!modelfetch1) return await interaction.reply({ content: "Sunucu verisi oluşturulamadı! Lütfen sistem yöneticisi ile iletişime geçiniz." })

                const returnCommand = client.slashCommands.get(interaction.commandName)
                returnCommand.run(client, interaction, args)
            }, 5000)
        }

        let registerSystem = modelfetch.settings?.registerSystem

        let embed1 = {
            color: Colors.LuminousVividPink,
            footer: {
                text: config.embedFooter
            },
            title:
                registerSystem.status == "enable" ?
                    `✅ Kayıt Olma Sistemi Aktif Hale Getirildi.` :
                    `✅ Kayıt Olma Sistemi Düzenlendi ve Aktif Hale Getirildi.`,
            description:
                `\`-\` Yönetim Bilgilendirme Kanalı: <#${infoChannel.id}> \n\n` +
                `\`-\` Yeni Üyelerin Kayıt Olacakları Kanal: <#${firstChannel.id}> \n` +
                `\`-\` Yeni Erkek Üyelerin Alacağı Rol: <@&${newManRole.id}> \n` +
                `\`-\` Yeni Kız Üyelerin Alacağı Rol: <@&${newWomanRole.id}> \n`,
        }

        registerSystem.status = `enable`
        registerSystem.firstChannelId = `${firstChannel.id}`
        registerSystem.infoChannelId = `${infoChannel.id}`
        registerSystem.newManRoleId = `${newManRole.id}`
        registerSystem.newWomanRoleId = `${newWomanRole.id}`
        modelfetch.save()

        await interaction.reply({ embeds: [embed1] }).catch((e) => log(e))

        let embed2 = {
            color: Colors.LuminousVividPink,
            footer: {
                text: config.embedFooter
            },
            title: `Sunucumuza hoşgeldin 👋🏻`,
            description:
                `\`#\` Kayıt olmak için sizlerden zorunlu olarak adınızı ve yaşınızı yazmanızı isteyeceğiz. \n` +
                `\`#\` Ek olarak soyadınızı ve varsa söylemek istediklerini yazmanız için iki bölüm daha var. \n` +
                `\`#\` **Kayıt ol** butonuna bastıktan sonra gerekli alanları doğru doldurmanız işleminizi hızlandırır. \n` +
                `\`#\` Bu süreçte sorun oluşursa eğer DM üzerinden bilgilendirme yapılır.`,
        }

        let register = new ButtonBuilder().setCustomId('register').setLabel('Kayıt Ol').setStyle('Success')
        let registerButtons = new ActionRowBuilder().addComponents(register)
        let channel = client.channels.cache.get(firstChannel.id)
        return channel.send({ embeds: [embed2], components: [registerButtons] }).catch((e) => log(e))
    }
}