const { localTime, Models, config } = require("../server")
const { MessageEmbed } = require("discord.js")

module.exports = {
    type: 'CHAT_INPUT',
    authorityLevel: "administrator",
    name: "sunucu-günlükleri",
    description: "Sunucunuzda gerçekleşen olayları deteylıca incelemenizi sağlar.",
    options: [
        {
            name: "günlükler",
            description: "Hangi günlüğün size bildirileceğini seçiniz.",
            type: "STRING",
            required: false,
            choices: [
                { name: "Kötü Söz Engellendiğinde", value: "log-v1" },
                { name: "Büyük Harf Engellendiğinde", value: "log-v2" },
                { name: "Reklam Engellendiğinde", value: "log-v3" },
                { name: "Bir Mesaj Silindiğinde", value: "log-v4" },
                { name: "Bir Mesaj Düzenlendiğinde", value: "log-v5" },
                { name: "Kullanıcının Özel Durumu Değiştiğinde", value: "log-v6" }
            ]
        },
        {
            name: "channel",
            description: "Bu özelliği açmak veya kaldırmak istediğinizi kanalı seçiniz.",
            type: "CHANNEL",
            required: false,
        }
    ],
    run: async (client, interaction, args) => {
        if (!interaction) return;
        let guild = client.guilds.cache.get(interaction.guildId)
        let returnCommand = client.slashCommands.get(interaction.commandName)
        let systemChannelId = guild.systemChannelId
        let MessageChannel = guild.channels.cache.get(systemChannelId ? systemChannelId : interaction.channel.id)

        let logs = interaction.options.getString("günlükler")
        let channel = interaction.options.getChannel("channel")
        
        let texts = {
            "m1": "Kötü Söz Engellendiğinde", "m2": "Büyük Harf Engellendiğinde",
            "m3": "Reklam Engellendiğinde", "m4": "Bir Mesaj Silindiğinde",
            "m5": "Bir Mesaj Düzenlendiğinde", "m6": "Kullanıcının Özel Durumu Değiştiğinde",
        }

        let Text = texts[`m${logs ? logs?.slice(logs?.search("log-") + 5, logs?.search("log-") + 6) : "-"}`]

        let guildData = await Models.guilds.findOne({ guildId: interaction?.guildId })
        let findLog = guildData?.logs?.filter(f => f.name == Text)[0]
        let fLog = (name) => {
            let data = guildData?.logs?.filter(f => f.name == name)[0]
            if (data) return new Promise((resolve) => resolve(data))
            return new Promise((resolve) => resolve(data))
        }

        if (!logs && channel) return interaction.reply({ content: `Hangi günlüğü açmak/kapatmak istediğinizi belirtmediniz.` })
        if (!logs) {
            let onTxt = "kanalında açık. \n"
            let offTxt = "_bu özellik kapalıdır._\n"
            let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **Aktif Olan Sunucu Günlükleri** \n` +
                    guildData?.logs?.map(m => `> ${m.name}: <#${m.channelId}> kanalına gönderilir.`).join(" \n") + " \n\n" + 
                    `_Not: Günlük açıksa ve bildirim gelmiyorsa sunucu ayarları yapılmamış olabilir._`
                )

            return interaction.reply({ embeds: [embed], ephemeral: true })
        }

        let webhooks = async (channelfetch) => channelfetch?.fetchWebhooks()
            .then(hooks => { return new Promise((resolve) => resolve(hooks)) })
            .catch((err) => { return new Promise((resolve) => resolve(null)) })
        let webhooksFetch = await webhooks(channel)
        let webhookfind = webhooksFetch?.filter(f => f.name == `${client.user.username} Bilgilendirme`).map(m => m)[0]

        if (!channel) {
            if (!findLog) return interaction.reply({ content: `${Text} bilgi mesajı gönderme sistemi aktif edilmemiştir.` })
            let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **${findLog.name}** \n` +
                    `> Özelliği açan: <@${findLog.ownerId}> \n` +
                    `> Bilgilendirme kanalı: <#${findLog.channelId}> \n` +
                    `> Aktif olma tarihi: ${findLog.activatedDate}`
                )

            return interaction.reply({ embeds: [embed], ephemeral: true })
        }

        if (findLog?.channelId == channel.id) {
            return await Models.guilds.updateOne(
                { guildId: interaction?.guildId },
                { $pull: { logs: { name: Text } } },
                { upsert: true }
            )
                .then(() => interaction.reply({ content: `Tamamdır artık ${Text} bilgi mesajı gönderilmeyecektir.` }))
                .catch(err => interaction.reply({
                    content: `Hata ile karşılaşıldı. \nBöyle bir ayarlama bulunamamış veya silme işleminde hata olmuş olabilir.`
                }))
        } else {
            await interaction.reply({ content: "İsteğiniz alındı, işlem devam ediyor.", ephemeral: true })
                .catch((err) => { })

            if (!guildData) {
                await Models.functions.guild.create(interaction.guildId)
                return setTimeout(() => returnCommand.run(client, interaction, args), 1500)
            }

            if (!webhookfind) {
                return channel.createWebhook(`${client.user.username} Bilgilendirme`, { avatar: client.user.displayAvatarURL() })
                    .then(() => returnCommand.run(client, interaction, args))
                    .catch((err) => {
                        MessageChannel.send(`<@${interaction.member.id}>, yetkim olmadığı için webhook'u oluşturamadım.`)
                            .catch((err) => { })
                    })
            }

            if (findLog) {
                return await Models.guilds.updateOne(
                    { guildId: interaction?.guildId },
                    { $pull: { logs: { name: Text } } },
                    { upsert: true }
                )
                .then(() => returnCommand.run(client, interaction, args))
                .catch((err) => {
                    MessageChannel.send(`<@${interaction.member.id}>, bir önceki veri sistemden silinemedi.`)
                        .catch((err) => { })
                })
            }

            return await Models.guilds.updateOne({ guildId: interaction?.guildId }, {
                $push: {
                    logs: {
                        name: Text,
                        activatedDate: findLog?.activatedDate ? findLog?.activatedDate : await localTime("DD MMMM YYYY HH.mm.ss"),
                        ownerId: interaction.member.id,
                        channelId: channel.id,
                        channelWebhookID: webhookfind.id,
                        channelWebhookTOKEN: webhookfind.token
                    }
                }
            }, { upsert: true })
                .then(() => {
                    MessageChannel.send(`<@${interaction.member.id}>, İşlem tamamdır, artık ${Text} bilgi mesajı gönderilecektir.`)
                        .catch((err) => { })
                })
                .catch((err) => {
                    MessageChannel.send(`<@${interaction.member.id}>, İşlem tamamlanamadı, veri kaydedilirken bir hata oluştu.`)
                        .catch((err) => { })
                })
        }
        return;
    }
}
