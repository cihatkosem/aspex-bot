module.exports = {
    names: ["test"],
    permission: "",
    run: async (client, message, args) => {
        let GuildEmojiManager = client.guilds.cache.get(message.guild.id).emojis
        return GuildEmojiManager.create("https://i.imgur.com/V5Sxvrb.png", "test")
        .then(emoji => message.channel.send(`tmmdır!`))
        .catch((err) => message.channel.send(`olmadı! \n${err}`))
    }
}
