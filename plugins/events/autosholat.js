import axios from "axios"

let handler = m => m

handler.before = async (m, { conn, participants }) => {
  if (!m.isGroup) return

  conn.autoshalat = conn.autoshalat || {}
  let id = m.chat
  if (id in conn.autoshalat) return false

  const kota = "3374" // Kota Semarang

  const now = new Date(new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta"
  }))

  const jam = now.getHours().toString().padStart(2, "0")
  const menit = now.getMinutes().toString().padStart(2, "0")
  const timeNow = `${jam}:${menit}`

  const tanggal = now.getDate()
  const bulan = now.getMonth() + 1
  const tahun = now.getFullYear()

  try {
    const url = `https://api.myquran.com/v2/sholat/jadwal/${kota}/${tahun}/${bulan}/${tanggal}`
    const res = await axios.get(url)
    const j = res.data.data.jadwal

    const jadwalSholat = {
      Subuh: j.subuh,
      Dzuhur: j.dzuhur,
      Ashar: j.ashar,
      Maghrib: j.maghrib,
      Isya: j.isya
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
              renderLargerThumbnail: true,
              sourceUrl: ""
            }
          }
        }, {
          quoted: m,
          mentions: participants.map(p => p.id)
        })

        setTimeout(() => {
          delete conn.autoshalat[id]
        }, 60000)
      }
    }
  } catch (e) {
    console.error("Autosholat error:", e.message)
  }
}

export default handler