let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `🍿 *Masukkan kata kunci video TikTok!*\n\n*Contoh:* ${usedPrefix + command} Tobrut*`,
      m
    );

  await global.wait(m, conn);

  try {
    const apiUrl = `https://api.nekolabs.my.id/discovery/tiktok/search?q=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Gagal ambil data dari API.`);

    const json = await res.json();
    const results = json.result;
    if (!results || results.length === 0)
      throw "🍔 *Tidak ada hasil ditemukan di TikTok!*";

    const cards = [];

    for (let i = 0; i < Math.min(10, results.length); i++) {
      const item = results[i];

      const caption = `
Judul: ${item.title || "-"}
Author: ${item.author?.name || "-"} (@${item.author?.username || "-"})
Audio: ${item.music_info?.title || "-"} — ${item.music_info?.author || "-"}

Views: ${item.stats?.play || "0"}
Likes: ${item.stats?.like || "0"}
Comment: ${item.stats?.comment || "0"}
Share: ${item.stats?.share || "0"}

Tanggal: ${item.create_at || "-"}
`.trim();

      cards.push({
        image: {
          url: item.cover || item.author?.avatar || "https://raw.githubusercontent.com/bagus-api/storage/master/HHDFK.webp"
        },

        title: `🎥 ${i + 1}. ${item.title || "(tanpa judul)"}`,
        body: caption,
        footer: "TikTok Search Engine",

        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "📺 Tonton",
              url: item.videoUrl
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "⬇️ Unduh Video",
              id: `${usedPrefix}ttdl ${item.videoUrl}`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🎵 Unduh Audio",
              id: `${usedPrefix}ytaudio ${item.musicUrl || item.videoUrl}`
            })
          }
        ]
      });
    }

    // KIRIM SEKALI PAKAI CAROUSEL
    await conn.sendCard(
      m.chat,
      {
        text: `🍢 Hasil pencarian TikTok: *${text}*`,
        title: "📌 TikTok Search",
        footer: "Geser untuk lihat video lainnya",
        cards
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    m.reply("🍵 *Terjadi kesalahan saat mengambil data dari TikTok.*");
  } finally {
    await global.wait(m, conn, true);
  }
};

handler.help = ["ttsearch"];
handler.tags = ["search"];
handler.command = /^(ttsearch)$/i;

export default handler;