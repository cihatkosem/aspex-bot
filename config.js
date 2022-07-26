module.exports = {
    prefix: "+",
    owner: "648040310857007115",
    developers: ["648040310857007115", "500527985061789711"],
    clientID: "972964572313030676",
    clientSecret: "dcLivZG6dusw6Ik_Q-fjdjamEXpzk1hc",
    token: "OTcyOTY0NTcyMzEzMDMwNjc2.G2bQpu.yj7Bax2V_mtupjflVyXtqLJHR4PzovlW-SWZ_A",
    color: "#9500ff",
    mongoURL: "mongodb+srv://Stcox:k1z1lelma7506@aspex.jxj1x.mongodb.net/aspex",
    twitch: "https://www.twitch.tv/bystcox",
    swears: require('./swears'),
    embedFooter: "Aspex - drizzlydeveloper.xyz",
    embedBanner: "https://media.discordapp.net/attachments/864451021546586125/985819989724508240/standard.gif",
    embedAnimateBar: "https://cdn.glitch.global/2e45939a-4462-4c3a-89fc-36699b686461/animate-bar.gif?v=1655653922906",
    inviteLink: "https://discord.com/api/oauth2/authorize?client_id=clientId&permissions=8&redirect_uri=http%3A%2F%2Fwebsite%2Fgirisyap%2Fdiscord&response_type=code&scope=bot%20applications.commands%20email%20guilds",
    activityes: [ 
      { text: "website | /yardım", waitSecond: "20" },
      { text: "drizzlydeveloper.xyz", waitSecond: "5" }
    ],
    settings: [
      { name: "Kötü Söz Engelleyici", tag: "swear-blocker" },
      { name: "Reklam Engelleyici", tag: "ad-blocker" },
      { name: "Büyük Harf Engelleyici", tag: "uppercase-blocker" },
      { name: "Kullanıcı Giriş Bilgilendirme", tag: "joined-user-information" },
      { name: "Kullanıcı Çıkış Bilgilendirme",  tag: "leaved-user-information" },
      { name: "Spotify'da Dinlenen Müzik", tag: "spotify-playing-information" },
      { name: "Sunucuya Özel Mesaj", tag: "private-message" },
      { name: "Sunucu Günlükleri", tag: "server-logs" },
      { name: "İşlemler", tag: "transactions" }
  ]
}
