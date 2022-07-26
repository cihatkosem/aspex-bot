const { swears } = require("./config.js")
const DayJs = require("dayjs")
const randomstring = require("randomstring")
const GoogleTranslate = require('translate-google')

require('dayjs/locale/tr')
require("dayjs").extend(require('dayjs/plugin/timezone'))
require("dayjs").extend(require('dayjs/plugin/utc'))
require("dayjs").locale('tr')

module.exports.localTime = async function time(format, date) {
    let data = date ? DayJs(date).tz('Asia/Istanbul') : DayJs().tz('Asia/Istanbul')
    return new Promise((resolve) => resolve(data.format(format)))
}

module.exports.swearBlocker = async function (content) {
    let ThereIs = swears.map(m => content.split(' ').includes(m))
    return new Promise((resolve) => {
        if (ThereIs.filter(f => f == true)[0]) resolve(true)
        else return resolve(null)
    })
}

module.exports.uppercaseBlocker = async function (content) {
    let text = content.split(" ").map(m => m).join("").split("")
    let ABC = content.match(/[A-ZİĞÜŞÖÇ]/g) ? content.match(/[A-ZİĞÜŞÖÇ]/g).map(m => m) : 0
    return new Promise((resolve) => resolve(ABC == 0 ? 0 : ABC.length * 100 / text.length))
}

module.exports.adBlocker = async function (content) {
    let match = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    let regex1 = new RegExp(match)
    let regex2 = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi)
    if (content.match(regex1) || content.match(regex2)) return new Promise((resolve) => resolve(true))
    else return new Promise((resolve) => resolve(null))
}

module.exports.randomId = async function (length) {
    let id = randomstring.generate({ length, charset: 'numeric' })
    return new Promise((resolve) => resolve(id))
}

module.exports.translate = async function (toLang, text) {
    return new Promise(async (resolve) => {
        resolve(toLang && text ? GoogleTranslate(text, { to: toLang }).then((res) => res).catch((err) => err) : null)
    })
}