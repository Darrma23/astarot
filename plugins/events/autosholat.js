let handler = m => m

handler.before = async (m, { conn, participants }) => {
  if (!m.isGroup) return

  conn.autoshalat = conn.autoshalat || {}
  let id = m.chat
  if (id in conn.autoshalat) return false

  // Waktu lokal WIB
  const now = new Date(new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta"
  }))

  const jam = now.getHours().toString().padStart(2, "0")
  const menit = now.getMinutes().toString().padStart(2, "0")
  const timeNow = `${jam}:${menit}`

  // Jadwal sholat lokal (Semarang)
  const jadwalSholat = {
    Subuh: "03:52",
    Dzuhur: "11:33",
    Ashar: "15:01",
    Maghrib: "17:49",
    Isya: "19:06"
  }

  for (let [nama, waktu] of Object.entries(jadwalSholat)) {
    if (timeNow === waktu) {
      conn.autoshalat[id] = true

      await conn.sendMessage(m.chat, {
        audio: {
          url: "https://media.vocaroo.com/mp3/1ofLT2YUJAjQ"
        },
        mimetype: "audio/mpeg",
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 1,
            title: `Waktu Sholat ${nama}`,
            body: `🕑 ${waktu} WIB • Semarang`,
            thumbnailUrl: "https://g.top4top.io/p_3622kvf4r1.jpg",
            renderLargerThumbnail: true
          }
        }
      }, {
        quoted: m,
        mentions: participants.map(p => p.id)
      })

      // Anti spam 1 menit
      setTimeout(() => {
        delete conn.autoshalat[id]
      }, 60000)
    }
  }
}

export default handler