const { ActionRowBuilder, ButtonBuilder, Colors } = require("discord.js")
const { config, log } = require("../server")

module.exports = {
    name: "register",
    run: async (client, interaction) => {
        let findInput = (value) => interaction.fields.getTextInputValue(value)
        let user = {
            name: findInput('name'),
            familyName: findInput('familyName'),
            age: findInput('age'),
            sentences: findInput('sentences'),
            gender: findInput('gender')
        }

        let AdminChannel = client.channels.cache.get("996811585928560812")

        let embed = {
            color: Colors.DarkPurple,
            footer: {
                text: config.embedFooter
            },
            title: `${interaction.member.user.username} kullanıcısının kayıt işlemi başlatıldı.`,
            description: 
            `> Discord ID: ${interaction.member.id}\n` + 
            `> Adı: ${user.name} \n` + 
            `> Soyadı: ${user.familyName} \n` +
            `> Yaşı: ${user.age} \n` + 
            `> Cinsiyeti: ${user.gender} \n` + 
            `> Hakkında: ${user.sentences}`,
        }

        let nextRegisterFunction = new ButtonBuilder().setCustomId('nextRegisterFunction')
            .setLabel('⏭️ Sonraki Adıma Geç').setStyle('Success')
        let directRegister = new ButtonBuilder().setCustomId('directRegister')
            .setLabel('✅ Direk Kayıt Et').setStyle('Primary')
        let cancelRegister = new ButtonBuilder().setCustomId('cancelRegister')
            .setLabel('❎ İşlemini İptal Et').setStyle('Danger')
        let blockRegister = new ButtonBuilder().setCustomId('blockRegister')
            .setLabel('❌ Kullanıcıyı Engelle').setStyle('Danger')

        let registerButtons = new ActionRowBuilder().addComponents(nextRegisterFunction, directRegister, cancelRegister, blockRegister)

        await interaction.member.setNickname(`~ ${interaction.member.user.username}`).catch((e) => log(e))

        let content = `İsteğiniz alınmış ve **${interaction.guild.name}** sunucusunda kayıt işleminiz başlatılmıştır.`
        await interaction.member.user.send({ content }).catch((e) => log(e))
        return await AdminChannel.send({ embeds: [embed], components: [registerButtons] }).catch((e) => log(e))
    }
}