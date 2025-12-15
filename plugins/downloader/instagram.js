let old = new Date()
import axios from "axios"

export default async function izuku(m, {
  conn,
  text,
  usedPrefix,
  command,
  args
}) {
  if (!args[0])
    return m.reply(
      `Masukin link Instagram.\nContoh:\n${usedPrefix + command} https://www.instagram.com/p/xxxx`
    )

  if (!args[0].includes("instagram.com"))
    return m.reply("Itu bukan link Instagram. Jangan ngelantur.")

  try {
  	await global.wait(m, conn);
    const { data } = await axios.get(
      "https://api.nekolabs.my.id/downloader/instagram",
      {
        params: { url: args[0] }
      }
    )

    if (!data.success) throw "API Nekolabs lagi bad mood"

    const { metadata, downloadUrl } = data.result
    const process = (new Date() - old) + " ms"

    const caption = `
👤 ${metadata.username}
❤️ ${metadata.like}   💬 ${metadata.comment}

${metadata.caption || ""}
⏱️ ${process}
`.trim()

    // ===== VIDEO =====
    if (metadata.isVideo) {
      return conn.sendFile(
        m.chat,
        downloadUrl[0],
        "instagram.mp4",
        caption,
        m
      )
    }

    // ===== FOTO / SLIDE =====
    if (downloadUrl.length > 1) {
      const album = downloadUrl.map(v => ({
        image: { url: v },
        caption
      }))

      const sent = await conn.sendAlbum(m.chat, album, {
        delay: 500,
        quoted: m
      })

      return conn.reply(
        m.chat,
        `Selesai.\n⏱️ ${process}`,
        sent
      )
    }

    // ===== SINGLE FOTO =====
    return conn.sendMessage(
      m.chat,
      {
        image: { url: downloadUrl[0] },
        caption
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply("❌ Error. Nekolabs capek atau IG lagi pelit.")
  }
  await global.wait(m, conn, true);
}

izuku.help = ["instagram", "ig", "igdl"].map(
  v => `${v} <link instagram>`
)
izuku.tags = ["downloader"]
izuku.command = ["instagram", "ig", "igdl"]
izuku.limit = true