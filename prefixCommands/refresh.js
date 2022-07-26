module.exports = {
    names: ["refresh", "yeniden_başlat"],
    permission: "developers",
    run: async (client, message, args) => {
        return message.react('👌🏻').then(() => setTimeout(() => process.exit(0), 5000)).catch((err) => null)
    }
}
