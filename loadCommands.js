const { client } = require("./server")
const fs = require("fs")

const slashCommandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'))
const prefixCommandFiles = fs.readdirSync('./prefixCommands').filter(file => file.endsWith('.js'))
const menuFiles = fs.readdirSync('./selectMenus').filter(file => file.endsWith('.js'))
const modalFiles = fs.readdirSync('./ModalSubmit').filter(file => file.endsWith('.js'))
const buttonFiles = fs.readdirSync('./clickButtons').filter(file => file.endsWith('.js'))

module.exports = async function loadCommands (arrayOfSlashCommands = []) {
    for (const file of slashCommandFiles) {
        let command = require(`./slashCommands/${file}`)
        client.slashCommands.set(command.name, command)
        arrayOfSlashCommands.push(command)
    }

    for (const file of prefixCommandFiles) {
        let command = require(`./prefixCommands/${file}`)
        client.prefixCommands.set(command.names, command)
    }

    for (const file of menuFiles) {
        let command = require(`./selectMenus/${file}`)
        client.selectMenus.set(command.name, command)
    }

    for (const file of modalFiles) {
        let command = require(`./ModalSubmit/${file}`)
        client.ModalSubmit.set(command.name, command)
    }
    
    for (const file of buttonFiles) {
        let command = require(`./clickButtons/${file}`)
        client.clickButtons.set(command.name, command)
    }

    await client.application.commands.set(arrayOfSlashCommands)
    //await client.application.commands.set([]) 
    //Eğik çizgi komutlarını tüm sunuculardan kaldırır.
}