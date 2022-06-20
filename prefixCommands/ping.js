const { client, config, swearBlocker, Models } = require("../server")
const { MessageEmbed, Permissions, Modal } = require("discord.js")

module.exports = {
    names: ["ping", "gecikme"],
    permission: "",
    run: async (client, message, args) => {
        return message.channel.send(`${client.ws.ping} ms!`)
    }
}
