import * as cheerio from "cheerio"
import axios from "axios"

const handler = async (m, { conn, args }) => {
  // ⛔ cegah bot balas pesan dia sendiri
  if (m.key?.fromMe) return

  // ⛔ cegah spam / handler kepanggil dobel paralel
  if (m._mediafire) return
  m._mediafire = true

  try {
    const link = args[0]
    if (!link || !/https?:\/\/(www\.)?mediafire\.com\//.test(link)) {
      return await m.reply("⚠️ Masukan link MediaFire yang valid!")
    }

    // optional: indikator proses, kalau kamu pake sistem wait
    await global.wait?.(m, conn)

    const res = await axios.get(link, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
      },
      timeout: 15000 // ⛔ biar ga gantung selamanya
    })

    const $ = cheerio.load(res.data)
    const url = $(".input.popsok").attr("href")

    if (!url || !/download\d+\.mediafire\.com/.test(url)) {
      return await m.reply("❌ Gagal dapetin link download MediaFire.")
    }

    const name =
      $(".intro .filename").text().trim() || "mediafire-file"
    const size =
      $(".details li:nth-child(1) span").text().trim() || "-"
    const type =
      $(".intro .filetype").text().trim() || "-"

    // download file
    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 0 // file besar, jangan dibatesin
    })

    const file = await conn.getFile(data)

    const caption = `
☘️ MediaFire Downloader ☘️
📄 Name : ${name}
📦 Size : ${size}
🗂️ Type : ${type}
🔗 Source : ${link}
    `.trim()

    await conn.sendMessage(
      m.chat,
      {
        document: data,
        mimetype: file.mime,
        fileName: name,
        caption
      },
      { quoted: m }
    )
  } catch (e) {
    console.error("MEDIAFIRE ERROR:", e)
    await m.reply("❌ Error. MediaFire ribet atau halaman berubah.")
  } finally {
    // ⛔ reset flag biar pesan berikutnya bisa diproses
    delete m._mediafire

    // optional: clear wait indicator kalau ada
    await global.wait?.(m, conn, true)
  }
}

handler.help = ["mediafire", "mf", "mfdl"]
handler.tags = ["downloader"]
handler.command = ["mediafire", "mf", "mfdl"]

export default handler