module.exports = {
    names: ["ping", "gecikme"],
    permission: "",
    run: async (client, message, args) => {
        return message.channel.send(`${client.ws.ping} ms!`)
    }
}
