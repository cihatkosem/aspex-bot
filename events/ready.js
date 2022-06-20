const { client, config } = require("../server")
const loadCommands = require("../loadCommands")

client.on('ready', async () => {
  await loadCommands()
  client.user.setActivity(`/yardım • ${client.guilds.cache.size} SERVER!`, { type: "STREAMING", url: config.twitch });
})