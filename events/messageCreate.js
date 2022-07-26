const { client, config, localTime, Models, swearBlocker, adBlocker, uppercaseBlocker, translate } = require("../server")
const { PermissionsBitField, EmbedBuilder, WebhookClient } = require("discord.js")

client.on('messageCreate', async (message) => {
    let prefix = process.env.PREFIX ? process.env.PREFIX : config.prefix
    let content = message.content.toLowerCase()
    let args = content.split(" ").map(m => m)
    
    let Flags = PermissionsBitField.Flags

    let modelfetch = await Models.guilds.findOne({ guildId: message?.guild?.id })
    let messageData = async (text) => modelfetch?.messages?.reverse().filter(f => f.receivedMessage == text)[0]
    let findCommand = await messageData(content.toLowerCase())
    let findPrefixCommand = await messageData(args[0].slice(1, 2000).toLowerCase())
    let webhookURL = `https://discord.com/api/webhooks/`
    let Log = (_name) => modelfetch?.logs?.filter(f => f.name == _name)[0]
    let webhook = (_name) => Log(_name) ? webhookURL + Log(_name)?.channelWebhookID + "/" + Log(_name)?.channelWebhookTOKEN : null

    if (modelfetch && modelfetch?.settings?.swearBlocker?.channels.filter(f => f == message.channel.id)[0]) {
        let checkSwear = await swearBlocker(content)
        if (checkSwear && !message.member.permissions.has(Flags.Administrator)) {
            message.delete().catch((err) => { })
            message.channel.send({ content: `${message.author}, Bu sunucuda **kötü söz** içeren mesaj yazmak yasaktır!` })
                .then((m) => setTimeout(() => m.delete(), 10000))
                .catch((err) => { })
            let fetchWebhook = webhook("Kötü Söz Engellendiğinde")
            if (fetchWebhook) {
                let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **Kötü Söz Engelleme - Bilgilendirme Sistemi** \n` +
                    `> <#${message.channel.id}> metin kanalında <@${message.author.id}> kişisi kötü söz kullandı.\n` +
                    `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${message.author.id}) \n\n` +
                    `\`\`\`Engellenen Mesaj: \n${message.content} \`\`\`\n`
                )
                let guildWebhook = new WebhookClient({ url: fetchWebhook })
                guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
                    .catch((err) => { })
            }
        }
    }

    if (modelfetch && modelfetch?.settings?.adBlocker?.channels.filter(f => f == message.channel.id)[0]) {
        let checkAd = await adBlocker(content)
        if (checkAd && !message.member.permissions.has(Flags.Administrator)) {
            message.delete().catch((err) => { })
            message.channel.send({ content: `${message.author}, Bu sunucuda **reklam** içeren mesaj yazmak yasaktır!` })
                .then((m) => setTimeout(() => m.delete(), 10000))
                .catch((err) => { })
            let fetchWebhook = webhook("Reklam Engellendiğinde")
            if (fetchWebhook) {
                let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **Reklam Engelleme - Bilgilendirme Sistemi** \n` +
                    `> <#${message.channel.id}> metin kanalında <@${message.author.id}> kişisi reklam yaptı.\n` +
                    `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${message.author.id}) \n\n` +
                    `\`\`\`Engellenen Mesaj: \n${message.content} \`\`\`\n`
                )
                let guildWebhook = new WebhookClient({ url: fetchWebhook })
                guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
                    .catch((err) => { })
            }
        }
    }

    if (modelfetch && modelfetch?.settings?.uppercaseBlocker?.channels.filter(f => f == message.channel.id)[0]) {
        let checkUppercase = await uppercaseBlocker(message.content)
        if (checkUppercase > 50 && !message.author.bot && !message.member.permissions.has(Flags.Administrator)) {
            message.delete().catch((err) => { })
            message.channel.send({ content: `${message.author}, Bu sunucuda **fazla büyük harf** içeren mesajlar yasaktır!` })
                .then((m) => setTimeout(() => m.delete(), 10000))
                .catch((err) => { })
            let fetchWebhook = webhook("Büyük Harf Engellendiğinde")
            if (fetchWebhook) {
                let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
                .setDescription(
                    `> **Büyük Harf Engelleme - Bilgilendirme Sistemi** \n` +
                    `> <#${message.channel.id}> metin kanalında <@${message.author.id}> kişisi çok fazla büyük harf kullandı.\n` +
                    `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${message.author.id}) \n\n` +
                    `\`\`\`Engellenen Mesaj: \n${message.content} \`\`\`\n`
                )
                let guildWebhook = new WebhookClient({ url: fetchWebhook })
                guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
                    .catch((err) => { })
            }
        }
    }

    if (findCommand) {
        if (findCommand.block == true) message.delete().catch((err) => { })
        if (findCommand.prefix == true) return;
        let sendContent = `${findCommand.sendMessage}`
        return message.reply({ content: sendContent }).catch((err) => { })
    }

    if (findPrefixCommand) {
        if (findPrefixCommand.block == true) message.delete().catch((err) => { })
        if (findPrefixCommand.prefix == false) return;
        let sendContent = `${findPrefixCommand.sendMessage}`
        return message.reply({ content: sendContent }).catch((err) => { })
    }

    if (content == "<@972964572313030676>") return message.reply(`${message.author}, komutlarımı görmek için \` /yardım \` yazabilirsin.`);

    if (content.slice(0, 1) !== prefix) return;

    if (findPrefixCommand) {
        if (findPrefixCommand.block == true) message.delete().catch((err) => { })
        if (findPrefixCommand.prefix == false) return;
        let sendContent = `${findPrefixCommand.sendMessage}`
        return message.reply({ content: sendContent }).catch((err) => { })
    }

    const command = client.prefixCommands.filter(f => f.names.includes(args[0].slice(1, 2000))).map(m => m)[0]
    if (!command)
        return message.reply({ content: "😕 Yazdığınız komut sistemde bulunmamaktadır.", ephemeral: true })
    if (command.permission == "developer" && !config.developers.includes(message.author.id))
        return message.reply({ content: "😕 Yazdığınız komutu yanlızca geliştirici ekibimiz kullanabilir.", ephemeral: true })
    if (command.permission && !message.member.permissions.has(Flags[command.permission]))
        return message.reply({ content: "😕 Yazdığınız komutu kullanabilmek için bu sunucuda daha üst yetkilere sahip olmanız gerekmektedir.", ephemeral: true })
    command.run(client, message).catch(async (error) => {
        console.log(error)
        return message.reply({
            content: "😕 Yazdığınız komutta bir hata meydana geldi. \n" +
                "Lütfen bunu \`help@drizzlydeveloper.xyz\` mail adresine yada \`/geri_bildirim\` komutu ile bildiriniz. \n" +
                `\`\`\`Hata oluşma zamanı: ${await localTime("DD MMMM YYYY HH.mm.ss")} \n` +
                `Hatanın genel konumu: ${args[0].slice(1, 2000)} \n\n` +
                `Hata:\n${await translate('tr', String(error))}\`\`\``,
            ephemeral: true
        }).catch((err) => console.log(err))
    })
})  