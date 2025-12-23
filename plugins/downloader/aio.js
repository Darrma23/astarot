/**
 ╔══════════════════════
      ⧉  [aio] — [downloader]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Scrape      : 
  [ https://builds.nekolabs.web.id/code/all-in-one-downloader.js ]
  [ https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/458 ]
  ✺ Req : Mifnity [ 6288226×××××× ]
*/

import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`*Contoh: ${usedPrefix + command} https://link-target.com*`)
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        let res = await fetch('https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json; charset=utf-8',
                'user-agent': 'Mozilla/5.0',
                'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
                'x-rapidapi-key': '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98'
            },
            body: JSON.stringify({ url: text })
        })

        let json = await res.json()

        let medias =
            json?.medias ||
            json?.data?.medias ||
            json?.result?.links ||
            []

        if (!Array.isArray(medias) || medias.length === 0) {
            throw 'Media tidak ditemukan atau link tidak didukung'
        }

        let source = json.source || json.platform || '-'
        let title = json.title || '-'

        let video = medias.filter(v => (v.type || v.mime || '').toLowerCase().includes('video'))
        let audio = medias.filter(v => (v.type || v.mime || '').toLowerCase().includes('audio'))
        let image = medias.filter(v => (v.type || v.mime || '').toLowerCase().includes('image'))

        if (video.length > 0) {
            let bestVideo = video.sort((a, b) =>
                (b.resolution || '').localeCompare(a.resolution || '')
            )[0]

            let videoRes = await fetch(bestVideo.url || bestVideo.link)
            let buffer = Buffer.from(await videoRes.arrayBuffer())
            let fileType = await fileTypeFromBuffer(buffer)

            let caption =
                `*🎯 ALL IN ONE DOWNLOADER*\n\n` +
                `*🔗 Source:* ${source}\n` +
                `*📛 Title:* ${title}\n` +
                `*🎥 Type:* video\n` +
                `*📐 Quality:* ${bestVideo.quality || bestVideo.resolution || '-'}`

            await conn.sendMessage(m.chat, {
                video: buffer,
                mimetype: fileType?.mime || 'video/mp4',
                caption
            }, { quoted: m })

            return
        }

        if (audio.length > 0) {
            let bestAudio = audio[0]

            let audioRes = await fetch(bestAudio.url || bestAudio.link)
            let buffer = Buffer.from(await audioRes.arrayBuffer())
            let fileType = await fileTypeFromBuffer(buffer)

            await conn.sendMessage(m.chat, {
                audio: buffer,
                mimetype: fileType?.mime || 'audio/mpeg'
            }, { quoted: m })

            return
        }

        if (image.length > 0) {
            let bestImage = image[0]

            let caption =
                `*🎯 ALL IN ONE DOWNLOADER*\n\n` +
                `*🔗 Source:* ${source}\n` +
                `*📛 Title:* ${title}\n` +
                `*🖼️ Type:* image`

            await conn.sendMessage(m.chat, {
                image: { url: bestImage.url || bestImage.link },
                caption
            }, { quoted: m })
        }
    } catch (e) {
        await m.reply(`*🍂 Gagal memproses downloader*\n\n*Reason:* ${e}`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['aio'];
handler.tags = ['downloader'];
handler.command = /^(aio|allinone)$/i;
handler.limit = true;

export default handler;