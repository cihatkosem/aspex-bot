module.exports = {
    names: ["refresh", "yeniden_başlat"],
    permission: "developers",
    run: async (client, message, args) => {
        message.reply(`Bu işlem birkaç saniye kadar sürecektir.`).catch((err) => { })
        return setTimeout(() => { process.exit(0) }, 5000) 
    }
}
