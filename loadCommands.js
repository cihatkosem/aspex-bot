const { client } = require("./server")
const fs = require("fs")

const arrayOfSlashCommands = []
const arrayOfPrefixCommands = []
const arrayOfSelectMenus = []

const commandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'))
const menuFiles = fs.readdirSync('./selectMenus').filter(file => file.endsWith('.js'))
const prefixFiles = fs.readdirSync('./prefixCommands').filter(file => file.endsWith('.js'))

module.exports = async function loadCommands () {
    for (const file of commandFiles) {
        const command = require(`./slashCommands/${file}`)
        client.slashCommands.set(command.name, command)
        arrayOfSlashCommands.push(command)
    }

    for (const file of prefixFiles) {
        const command = require(`./prefixCommands/${file}`)
        client.prefixCommands.set(command.names, command)
        arrayOfPrefixCommands.push(command)
    }

    for (const file of menuFiles) {
        const command = require(`./selectMenus/${file}`)
        client.selectMenus.set(command.name, command)
        arrayOfSelectMenus.push(command)
    }

    await client.application.commands.set(arrayOfSlashCommands)
    //await client.application.commands.set([]) //-> Gerekmedikçe kullanma!
}