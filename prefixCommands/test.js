const discordTTS = require("discord-tts");
const { AudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
    names: ["test"],
    permission: "",
    run: async (client, message, args) => {
        let voiceConnection;
        let audioPlayer = new AudioPlayer();
        let text = `Merhaba sayın ${message.member.user.username}, ${message.guild.name} sunucusuna tekrardan hoşgeldin.`
        const stream = discordTTS.getVoiceStream(text, { lang: "tr", timeout: 2000 });
        const audioResource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
        if (!voiceConnection || voiceConnection?.status === VoiceConnectionStatus.Disconnected) {
            voiceConnection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.guildId,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            voiceConnection = await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
        }

        if (voiceConnection.status === VoiceConnectionStatus.Connected) {
            voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audioResource)
        }
        message.channel.send("++")
    }
}
