const { client, config, swearBlocker, localTime, translate } = require("../server")
const { PermissionsBitField, EmbedBuilder, InteractionType, ChannelType, ApplicationCommandOptionType } = require("discord.js")

client.on("interactionCreate", async (interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
        if (interaction.channel.type === ChannelType.DM)
            return interaction.reply({ content: "😐 Komutu burada kullanamazsınız.", ephemeral: true })
        const cmd = client.slashCommands.get(interaction.commandName)
        if (!cmd) return interaction.reply({ content: "😕 Komuta erişim sağlanamadı.", ephemeral: true })
        const args = []
        for (let option of interaction.options.data) {
            if (option.type === ApplicationCommandOptionType.Subcommand) {
                if (option.name) args.push(option.name)
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value)
                })
            } else if (option.value) args.push(option.value)
        }

        interaction.member = interaction.guild.members.cache.get(interaction.user.id)
        
        let memberPerms = interaction.member.permissions
        let permissionCheck = memberPerms.has(
            cmd.authorityLevel == "can-ban" ? PermissionsBitField.Flags.BanMembers : 
            cmd.authorityLevel == "can-kick" ? PermissionsBitField.Flags.KickMembers :
            cmd.authorityLevel == "message-manager" ? PermissionsBitField.Flags.ManageMessages : 
            cmd.authorityLevel == "administrator" ? PermissionsBitField.Flags.Administrator : PermissionsBitField.Flags.SendMessages
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
                    `Hata:\n${await translate('tr', String(error))} \n\n` +
                    `Error:\n${String(error)}\`\`\``,
                ephemeral: true
            }).catch((err) => console.log(err))
        })
    }

    if (interaction.isButton()) { 
        const cmd = client.clickButtons.get(interaction.customId)
        if (!cmd) return interaction.reply({ content: "😕 Seçim yaptığınız menü sistemde bulunmamaktadır.", components: [], ephemeral: true })
        interaction.member = interaction.guild.members.cache.get(interaction.user.id)
        try { cmd.run(client, interaction) }
        catch (error) { console.log(error) }
    }

    if (interaction.isSelectMenu()) {
        const cmd = client.selectMenus.get(interaction.customId)
        if (!cmd) return interaction.reply({ content: "😕 Seçim yaptığınız menü sistemde bulunmamaktadır.", components: [], ephemeral: true })
        interaction.member = interaction.guild.members.cache.get(interaction.user.id)
        await interaction.deferUpdate()
        try { cmd.run(client, interaction) }
        catch (error) { console.log(error) }
    }

    if (interaction.type === InteractionType.ModalSubmit) {
        const cmd = client.ModalSubmit.get(interaction.customId)
        if (!cmd) return;
        interaction.member = interaction.guild.members.cache.get(interaction.user.id)
        await interaction.deferUpdate()
        try { cmd.run(client, interaction) }
        catch (error) { console.log(error) }
    }
})
