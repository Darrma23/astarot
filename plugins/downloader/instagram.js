/**
 ╔══════════════════════
    ❏ 『instagram — downloader』
╚══════════════════════

  ✧ Type     : Plugin ESM
  ✧ Source   : https://whatsapp.com/channel/0029VbBDUSa90x2qZ82Niw2h
  ✧ Creator  : sxZeclips
  ✧ API   : [ https://izukumii-instagram-api.hf.space/ ]
  ✧ Note : Story belum fully support, tapi vid + image (album) aman
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`*Contoh:*\n${usedPrefix + command} https://www.instagram.com/reel/xxxx`);
        }

        await global.wait(m, conn);

        let url = text.trim();

        if (!/instagram\.com/i.test(url)) {
            return m.reply(`🍂 *URL tidak valid.*`);
        }

        if (/instagram\.com\/stories\//i.test(url)) {
            return m.reply(`🍂 *Instagram Story belum didukung.*\nGunakan link *Post / Reel / Album*.`);
        }

        let api = `https://izukumii-instagram-api.hf.space/?url=${encodeURIComponent(url)}`;
        let res = await fetch(api);

        if (!res.ok) {
            return m.reply(`🍂 *Gagal mengambil data.*`);
        }

        let json = await res.json();

        if (json.status !== 200 || !Array.isArray(json.download) || !json.download.length) {
            return m.reply(`🍂 *Media tidak ditemukan.*`);
        }

        for (let media of json.download) {
            let isVideo = /\.(mp4|mov|webm)/i.test(media);

            if (isVideo) {
                await conn.sendMessage(
                    m.chat,
                    { video: { url: media } },
                    { quoted: m }
                );
            } else {
                await conn.sendMessage(
                    m.chat,
                    { image: { url: media } },
                    { quoted: m }
                );
            }
        }
    } catch (e) {
        await m.reply(`🍂 *Terjadi kesalahan.*`);
    } finally {
    	await global.wait?.(m, conn, true);
    }
};

handler.help = ["instagram"];
handler.tags = ["downloader"];
handler.command = /^(ig|instagram|igdl)$/i;
handler.limit = true;

export default handler;