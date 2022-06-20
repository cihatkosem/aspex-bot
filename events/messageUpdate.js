const { client, config, localTime, Models, swearBlocker, adBlocker, translate } = require("../server")
const { MessageEmbed, Permissions, Modal, MessageAttachment } = require("discord.js")

client.on('messageUpdate', async (oldMessage, newMessage) => {
    let content = newMessage.content.toLowerCase()
    let args = content.split(" ").map(m => m)
    let modelfetch = await Models.guilds.findOne({ guildId: newMessage?.guild?.id })
    
    if (modelfetch && modelfetch?.settings?.swearBlocker?.channels.filter(f => f == newMessage.channel.id)[0]) {
      let checkSwear = await swearBlocker(content)
      if (checkSwear && !newMessage.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        newMessage.delete().catch((err) => { })
        newMessage.channel.send({ content: `${newMessage.author} Bu sunucuda **kötü söz** içeren mesaj yazmak yasaktır!` })
          .then((m) => setTimeout(() => m.delete(), 10000))
          .catch((err) => { })
      }
    }
  
    if (modelfetch && modelfetch?.settings?.adBlocker?.channels.filter(f => f == newMessage.channel.id)[0]) {
      let checkAd = await adBlocker(content)
      if (checkAd && !newMessage.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        newMessage.delete().catch((err) => { })
        newMessage.channel.send({ content: `${newMessage.author} Bu sunucuda **reklam** içeren mesaj yazmak yasaktır!` })
          .then((m) => setTimeout(() => m.delete(), 10000))
          .catch((err) => { })
      }
    }
})  