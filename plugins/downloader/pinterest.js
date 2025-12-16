import axios from "axios";

const handler = async (m, { conn, text }) => {
  try {
    await global.wait(m, conn);

    if (!text) return m.reply("Contoh:\n.pin https://pin.it/xxxx");

    await conn.sendPresenceUpdate("composing", m.chat);

    const api = `https://api.elrayyxml.web.id/api/downloader/pinterest?url=${encodeURIComponent(text)}`;
    const { data } = await axios.get(api, { timeout: 20000 });

    if (!data.status || !data.result) {
      return m.reply("Gagal mengambil data Pinterest.");
    }

    const media = data.result.image;
    if (!media) return m.reply("Media tidak ditemukan.");

    const file = await axios.get(media, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    const buffer = Buffer.from(file.data);

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: "Pinterest Image"
      },
      { quoted: m }
    );

    await global.wait(m, conn, true);

  } catch (e) {
    m.reply("Error: " + e.message);
  }
};

handler.help = ["pin <url>"];
handler.tags = ["downloader"];
handler.command = /^pin$/i;

export default handler;