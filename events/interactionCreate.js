const { client, config, swearBlocker, Models, localTime, translate } = require("../server")
const { MessageEmbed, Permissions, Modal } = require("discord.js")

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const cmd = client.slashCommands.get(interaction.commandName)
        if (!cmd) return interaction.reply({ content: "😕 Komuta erişim sağlanamadı.", ephemeral: true })
        const args = []
        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name)
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value)
                })
            } else if (option.value) args.push(option.value)
        }
      
        interaction.member = interaction.guild.members.cache.get(interaction.user.id)
        let flags = Permissions.FLAGS
        let memberPerms = interaction.member.permissions
        let permissionCheck = memberPerms.has(
          cmd.authorityLevel == "can-ban" ? flags.BAN_MEMBERS : cmd.authorityLevel == "can-kick" ? flags.KICK_MEMBERS : 
          cmd.authorityLevel == "message-manager" ? flags.MANAGE_MESSAGES : cmd.authorityLevel == "administrator" ? flags.ADMINISTRATOR : flags.SEND_MESSAGES
        )
        
        if (!permissionCheck || cmd.authorityLevel == "developers" && !config.developers.includes(interaction.member.user.id))
             return interaction.reply({ content: "😕 Komutu kullanabilmek için yeterli yetkiye sahip değilsiniz.", ephemeral: true })
      
        cmd.run(client, interaction, args).catch(async (error) => { 
          console.log(error)
          return interaction.reply({ 
            content: "😕 Yazdığınız komutta bir hata meydana geldi. \n" + 
            "Lütfen bunu \`help@drizzlydeveloper.xyz\` mail adresine yada \`/geri_bildirim\` komutu ile bildiriniz. \n" + 
            `\`\`\`Hata oluşma zamanı: ${await localTime("DD MMMM YYYY HH.mm.ss")} \n` + 
            `Hatanın genel konumu: ${interaction.commandName} \n\n` + 
            `Hata:\n${await translate('tr', String(error))}\`\`\``,
            ephemeral: true 
          }).catch((err) => console.log(err))
        })
    }
  
    if (interaction.isButton()) { }
    if (interaction.isSelectMenu()) { 
        const cmd = client.selectMenus.get(interaction.customId)
        if (!cmd) return interaction.reply({ content: "😕 Seçim yaptığınız menü sistemde bulunmamaktadır.", components: [], ephemeral: true })
        interaction.member = interaction.guild.members.cache.get(interaction.user.id)
        await interaction.deferUpdate()
        try { cmd.run(client, interaction) } 
        catch (error) { console.log(error) }
    }
  
    if (interaction.isModalSubmit()) {
        const feedback_description = interaction.fields.getTextInputValue('feedback_description')
        if (feedback_description) {
            let check = swearBlocker(feedback_description)
            if (check == true) return;

            await interaction.reply({ content: 'Teşekkürler, geri bildiriminiz başarıyla gönderildi!', ephemeral: true });
            let channel = client.guilds.cache.get("939976041932398692").channels.cache.get("986941238232104990")
            let embed = new MessageEmbed()
                .setColor(config.color)
                .setAuthor({ name: interaction.member.user.username, iconURL: interaction.member.user.displayAvatarURL() })
                .setDescription(`
            > Gönderen: ${interaction.member}
            > Hakkında detaylı bilgi [tıkla →](http://drizzlydeveloper.xyz/api/discord/users/${interaction.member.id}) \n
            \`\`\`${feedback_description}\`\`\`
            `)
                .setTimestamp()
                .setFooter({ text: `${client.user.username} • Drizzly Developer`, iconURL: client.user.displayAvatarURL() })

            channel.send({ embeds: [embed] })
        }
    }
})
