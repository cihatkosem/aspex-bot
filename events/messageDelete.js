const { client, config, Models } = require("../server")
const { WebhookClient, EmbedBuilder } = require("discord.js")

client.on('messageDelete', async (message) => {
    let modelfetch = await Models.guilds.findOne({ guildId: message?.guildId })
    let webhookURL = `https://discord.com/api/webhooks/`
    let Log = (_name) => modelfetch?.logs?.filter(f => f.name == _name)[0]
    let webhook = (_name) => Log(_name) ? webhookURL + Log(_name)?.channelWebhookID + "/" + Log(_name)?.channelWebhookTOKEN : null
    let fetchWebhook = webhook("Bir Mesaj Silindiğinde")
    if (fetchWebhook && message.author.bot == false) {
        let embed = new EmbedBuilder().setColor(config.color).setFooter({ text: config.embedFooter })
        .setDescription(
            `> **Bir Mesaj Silinmesi - Bilgilendirme Sistemi** \n` +
            `> <#${message.channelId}> metin kanalında <@${message.author.id}> kişisi mesajını sildi.\n` +
            `> Kişi hakkında detaylı bilgi için [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${message.author.id}) \n\n` +
            `\`\`\`Silinen Mesaj: \n${message.content}\`\`\``
        )
        let guildWebhook = new WebhookClient({ url: fetchWebhook })
        guildWebhook.send({ username: client.user.username, avatarURL: client.user.displayAvatarURL(), embeds: [embed] })
            .catch((err) => { })
    }

})