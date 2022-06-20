async function connect(mongoose, url) {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log(`✅ MongoDB: ${mongoose?.connections[0]?.name}`))
        .catch(() => console.log("❎ MongoDB: Not Connection"))
}

module.exports = connect