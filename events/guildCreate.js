const { client, Models } = require("../server")
client.on('guildCreate', async (guild) => await Models.functions.guild.create(guild.id))