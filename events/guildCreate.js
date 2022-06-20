const { client, localTime, config, Models } = require("../server")
const axios = require("axios")
const { WebhookClient, MessageEmbed } = require("discord.js")

client.on('guildCreate', async (guild) => {
    await Models.functions.guild.create(guild.id)
})