const { MessageEmbed, Permissions } = require("discord.js")
const { client, config, localTime, Models, randomId } = require("../server")
const axios = require("axios")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "administrator",
    name: "büyük-harfli-yazı-engel",
    description: "Belirttiğiniz kanala yazılan büyük harfli yazılar engellenir veya engeli kaldırır.",
    options: [
        {
            name: "channel",
            description: "Engellemek veya engelini kaldırmak istediğinizi kanalı seçiniz.",
            type: "CHANNEL",
            required: false,
        },
    ],

    run: async (client, interaction, args) => {
        if (!interaction) return;
        let channel = interaction.options.getChannel("channel")
        let modelfetch = await Models.guilds.findOne({ guildId: channel?.guildId || interaction?.guildId })
        let channels = modelfetch?.settings?.uppercaseBlocker?.channels
        let _channels = modelfetch?.settings?.uppercaseBlocker?.channels?.map(m => `<#${m}>`)

        if (!channel) {
            let text1 = `Sunucuda sırasıyla ${_channels} kanallarında büyük harf içeren yazılar engellenmektedir.`
            let text2 = `Sunucuda herhangi bir kanalda büyük harf içeren yazılar engellenmemektedir.`
            return await interaction.reply({ content: _channels[0] ? text1 : text2 })
        }

        if (channel?.type !== "GUILD_TEXT")
            return await interaction.reply({ content: `Sunucuda büyük harf içeren yazılar yanlızca **metin kanalları**nda engellenebilir.` })

        if (!modelfetch) {
            await interaction.reply({ content: "Sunucu verisi daha önceden oluşturulmamış, lütfen biraz bekleyin." })
            await Models.functions.guild.create(channel.guildId)

            return setTimeout(async (modelfetch) => {
                let modelfetch1 = await Models.guilds.findOne({ guildId: channel?.guildId || interaction?.guildId })
                if (!modelfetch1) return await interaction.reply({ content: "Sunucu verisi oluşturulamadı! Lütfen sistem yöneticisi ile iletişime geçiniz." })

                const returnCommand = client.slashCommands.get(interaction.commandName)
                returnCommand.run(client, interaction, args)
            }, 5000)
        }

        let channelBlock = channels?.filter(f => f == `${channel?.id}`)
        let orderchannelsBlock = channels?.filter(f => f !== `${channel?.id}`)
        let isitblocked = channelBlock ? channelBlock[0] ? "engellenmeyecektir" : "engellenecektir" : null

        if (channelBlock[0]) {
            await Models.guilds.updateOne(
                { guildId: channel?.guildId || interaction?.guildId },
                { 'settings.uppercaseBlocker.channels': orderchannelsBlock ? orderchannelsBlock : [] }
            )
        }
        else {
            channels.push(channel.id)
            modelfetch.save()
        }
      
        let blockedChannels = channelBlock[0] ? orderchannelsBlock.map(m => `<#${m}>`) : _channels + ` <#${channel.id}>`
        
        try {
            await interaction.reply({
                content: `İşlem tamamdır, artık <#${channel.id}> kanalında büyük harf içeren yazılar ${isitblocked}. \n> Engellenen kanallar: ${blockedChannels}`
            })
        } catch (err) {
            await interaction.channel.send({
                content: `İşlem tamamdır, artık <#${channel.id}> kanalında büyük harf içeren yazılar ${isitblocked}. \n> Engellenen kanallar: ${blockedChannels}`
            })
        }

        await Models.guilds.updateOne({ guildId: channel?.guildId || interaction?.guildId }, {
            $push: {
                transactions: {
                    id: await randomId(18),
                    ownerId: interaction.member.id,
                    date: await localTime("DD MMMM YYYY HH.mm.ss"),
                    name: "Büyük harf içeren yazıları engelleme sisteminde değişiklik yapıldı.",
                    oldValue: orderchannelsBlock.map(m => m),
                    addedValue: `${channelBlock[0] ? "" : channel.id}`,
                    removedValue: `${channelBlock[0] ? channel.id : ""}`
                }
            }
        }, { upsert: true }).catch(err => console.log(err))
    }
}