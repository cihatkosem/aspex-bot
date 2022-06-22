const { client, config, Models, swearBlocker, adBlocker } = require("../server")
const { Permissions, MessageEmbed, WebhookClient } = require("discord.js")

client.on('messageUpdate', async (oldMessage, newMessage) => {
    let content = newMessage.content.toLowerCase()
    let args = content.split(" ").map(m => m)
    let modelfetch = await Models.guilds.findOne({ guildId: newMessage?.guild?.id })
    let messageData = async (text) => modelfetch?.messages?.reverse().filter(f => f.receivedMessage == text)[0]
    let findCommand = await messageData(content.toLowerCase())
    let findPrefixCommand = await messageData(args[0].slice(1, 2000).toLowerCase())

    let webhookURL = `https://discord.com/api/webhooks/`
    let Log = (_name) => modelfetch?.logs?.filter(f => f.name == _name)[0]
    let webhook = (_name) => Log(_name) ? webhookURL + Log(_name)?.channelWebhookID + "/" + Log(_name)?.channelWebhookTOKEN : null

    if (modelfetch && modelfetch?.settings?.swearBlocker?.channels.filter(f => f == newMessage.channel.id)[0]) {
        let checkSwear = await swearBlocker(content)
        if (checkSwear && !newMessage.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            newMessage.delete().catch((err) => { })
            newMessage.channel.send({ content: `${newMessage.author}, Bu sunucuda **kötü söz** içeren mesaj yazmak yasaktır!` })
                .then((m) => setTimeout(() => m.delete(), 10000))
                .catch((err) => { })
            let fetchWebhook = webhook("Kötü Söz Engellendiğinde")
            if (fetchWebhook) {
                let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **Kötü Söz Engelleme - Bilgilendirme Sistemi** \n` +
                    `> <#${newMessage.channel.id}> metin kanalında <@${newMessage.author.id}> kişisi kötü söz kullandı.\n` +
                    `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${newMessage.author.id}) \n\n` +
                    `\`\`\`Engellenen Mesaj: \n${newMessage.content} \`\`\`\n`
                )
                let guildWebhook = new WebhookClient({ url: fetchWebhook })
                guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
                    .catch((err) => { })
            }
        }
    }

    if (modelfetch && modelfetch?.settings?.adBlocker?.channels.filter(f => f == newMessage.channel.id)[0]) {
        let checkAd = await adBlocker(content)
        if (checkAd && !newMessage.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            newMessage.delete().catch((err) => { })
            newMessage.channel.send({ content: `${newMessage.author}, Bu sunucuda **reklam** içeren mesaj yazmak yasaktır!` })
                .then((m) => setTimeout(() => m.delete(), 10000))
                .catch((err) => { })
            let fetchWebhook = webhook("Reklam Engellendiğinde")
            if (fetchWebhook) {
                let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **Reklam Engelleme - Bilgilendirme Sistemi** \n` +
                    `> <#${newMessage.channel.id}> metin kanalında <@${newMessage.author.id}> kişisi reklam yaptı.\n` +
                    `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${newMessage.author.id}) \n\n` +
                    `\`\`\`Engellenen Mesaj: \n${newMessage.content} \`\`\`\n`
                )
                let guildWebhook = new WebhookClient({ url: fetchWebhook })
                guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
                    .catch((err) => { })
            }
        }
    }

    if (modelfetch && modelfetch?.settings?.uppercaseBlocker?.channels.filter(f => f == newMessage.channel.id)[0]) {
        let checkUppercase = await uppercaseBlocker(newMessage.content)
        if (checkUppercase > 50 && !newMessage.author.bot && !newMessage.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            newMessage.delete().catch((err) => { })
            newMessage.channel.send({ content: `${newMessage.author}, Bu sunucuda **fazla büyük harf** içeren mesajlar yasaktır!` })
                .then((m) => setTimeout(() => m.delete(), 10000))
                .catch((err) => { })
            let fetchWebhook = webhook("Büyük Harf Engellendiğinde")
            if (fetchWebhook) {
                let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **Büyük Harf Engelleme - Bilgilendirme Sistemi** \n` +
                    `> <#${newMessage.channel.id}> metin kanalında <@${newMessage.author.id}> kişisi çok fazla büyük harf kullandı.\n` +
                    `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${newMessage.author.id}) \n\n` +
                    `\`\`\`Engellenen Mesaj: \n${newMessage.content} \`\`\`\n`
                )
                let guildWebhook = new WebhookClient({ url: fetchWebhook })
                guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
                    .catch((err) => { })
            }
        }
    }

    let fetchWebhook = webhook("Bir Mesaj Düzenlendiğinde")
    if (fetchWebhook) {
        let embed = new MessageEmbed().setColor(config.color).setFooter({ text: config.embedFooter })
        .setDescription(
            `> **Bir Mesaj Düzenlenmesi - Bilgilendirme Sistemi** \n` +
            `> <#${newMessage.channel.id}> metin kanalında <@${newMessage.author.id}> kişisi varsayılan mesajını düzenledi.\n` +
            `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${newMessage.author.id}) \n\n` +
            `\`\`\`Eski Mesaj: \n${oldMessage.content} \n\nYeni Mesaj: \n${newMessage.content}\`\`\`\n`
        )
        let guildWebhook = new WebhookClient({ url: fetchWebhook })
        guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
            .catch((err) => { })
    }

    if (findCommand) {
        if (findCommand.block == true) newMessage.delete().catch((err) => { })
        if (findCommand.prefix == true) return;
        let sendContent = `${findCommand.sendMessage}`
        return newMessage.reply({ content: sendContent }).catch((err) => { })
    }

    if (findPrefixCommand) {
        if (findPrefixCommand.block == true) newMessage.delete().catch((err) => { })
        if (findPrefixCommand.prefix == false) return;
        let sendContent = `${findPrefixCommand.sendMessage}`
        return newMessage.reply({ content: sendContent }).catch((err) => { })
    }
})  