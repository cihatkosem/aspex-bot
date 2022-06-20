const { client, config, localTime, Models, swearBlocker, adBlocker, uppercaseBlocker, translate } = require("../server")
const { MessageEmbed, Permissions, Modal, MessageAttachment } = require("discord.js")

client.on('messageCreate', async (message) => {
    let content = message.content.toLowerCase()
    let args = content.split(" ").map(m => m)
    let modelfetch = await Models.guilds.findOne({ guildId: message?.guild?.id })
    let messageData = async (text) => modelfetch?.messages?.reverse().filter(f => f.receivedMessage == text)[0]
    let findCommand = await messageData(content.toLowerCase())
    let findPrefixCommand = await messageData(args[0].slice(1,2000).toLowerCase())
  
    if (modelfetch && modelfetch?.settings?.swearBlocker?.channels.filter(f => f == message.channel.id)[0]) {
      let checkSwear = await swearBlocker(content)
      if (checkSwear && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        message.delete().catch((err) => { })
        message.channel.send({ content: `${message.author}, Bu sunucuda **kötü söz** içeren mesaj yazmak yasaktır!` })
          .then((m) => setTimeout(() => m.delete(), 10000))
          .catch((err) => { })
      }
    }
  
    if (modelfetch && modelfetch?.settings?.adBlocker?.channels.filter(f => f == message.channel.id)[0]) {
      let checkAd = await adBlocker(content)
      if (checkAd && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        message.delete().catch((err) => { })
        message.channel.send({ content: `${message.author}, Bu sunucuda **reklam** içeren mesaj yazmak yasaktır!` })
          .then((m) => setTimeout(() => m.delete(), 10000))
          .catch((err) => { })
      }
    }
  
    if (modelfetch && modelfetch?.settings?.uppercaseBlocker?.channels.filter(f => f == message.channel.id)[0]) {
      let checkUppercase = await uppercaseBlocker(message.content)
      if (checkUppercase > 50 && !message.author.bot && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        message.delete().catch((err) => { })
        message.channel.send({ content: `${message.author}, Bu sunucuda **fazla büyük harf** içeren mesajlar yasaktır!` })
          .then((m) => setTimeout(() => m.delete(), 10000))
          .catch((err) => { })
      }
    }
  
    if (findCommand) {
      if (findCommand.block == true) message.delete().catch((err) => { })
      if (findCommand.prefix == true) return;
      let sendContent = `${findCommand.sendMessage}` 
      return message.reply({ content: sendContent }).catch((err) => { })
    }
  
    if (content == "<@972964572313030676>") return message.reply(`${message.author}, komutlarımı görmek için \` /yardım \` yazabilirsin.`);
  
    if (content.slice(0,1) !== config.prefix) return;
  
    if (findPrefixCommand) {
      if (findPrefixCommand.block == true) message.delete().catch((err) => { })
      if (findPrefixCommand.prefix == false) return;
      let sendContent = `${findPrefixCommand.sendMessage}` 
      return message.reply({ content: sendContent }).catch((err) => { })
    }
  
    const command = client.prefixCommands.filter(f => f.names.includes(args[0].slice(1,2000))).map(m => m)[0]
    if (!command) 
        return message.reply({ content: "😕 Yazdığınız komut sistemde bulunmamaktadır.", ephemeral: true })
    if (command.permission == "developer" && !config.developers.includes(message.author.id))
        return message.reply({ content: "😕 Yazdığınız komutu yanlızca geliştirici ekibimiz kullanabilir.", ephemeral: true })
    if (command.permission && !message.member.permissions.has(Permissions.FLAGS[command.permission]))
        return message.reply({ content: "😕 Yazdığınız komutu kullanabilmek için bu sunucuda daha üst yetkilere sahip olmanız gerekmektedir.", ephemeral: true })
    command.run(client, message).catch(async (error) => { 
      console.log(error)
      return message.reply({ 
        content: "😕 Yazdığınız komutta bir hata meydana geldi. \n" + 
        "Lütfen bunu \`help@drizzlydeveloper.xyz\` mail adresine yada \`/geri_bildirim\` komutu ile bildiriniz. \n" + 
        `\`\`\`Hata oluşma zamanı: ${await localTime("DD MMMM YYYY HH.mm.ss")} \n` + 
        `Hatanın genel konumu: ${args[0].slice(1,2000)} \n\n` + 
        `Hata:\n${await translate('tr', String(error))}\`\`\``,
        ephemeral: true 
      }).catch((err) => console.log(err))
    })
})  