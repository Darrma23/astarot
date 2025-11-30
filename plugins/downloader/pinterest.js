import axios from "axios";

const handler = async (m, { conn, text }) => {
    try {
        // WAIT AWAL
        await global.wait(m, conn);

        if (!text) return m.reply("Contoh:\n.pin https://pin.it/xxxx");

        await conn.sendPresenceUpdate("composing", m.chat);

        const api = `https://api.deline.web.id/downloader/pinterest?url=${encodeURIComponent(text)}`;
        const r = await axios.get(api, { timeout: 20000 });

        if (!r.data || !r.data.result) {
            return m.reply("Gagal mengambil data.");
        }

        const media =
            r.data.result.url ||
            r.data.result.media ||
            r.data.result.download_url ||
            null;

        if (!media) return m.reply("Media tidak ditemukan.");

        const file = await axios.get(media, {
            responseType: "arraybuffer",
            timeout: 30000
        });

        const buff = Buffer.from(file.data);
        const ext = media.split(".").pop().split("?")[0].toLowerCase();

        if (["mp4", "mov", "webm"].includes(ext)) {
            await conn.sendMessage(
                m.chat,
                {
                    video: buff,
                    caption: "Pinterest Video"
                },
                { quoted: m }
            );
        } else {
            await conn.sendMessage(
                m.chat,
                {
                    image: buff,
                    caption: "Pinterest Image"
                },
                { quoted: m }
            );
        }

        // WAIT AKHIR
        await global.wait(m, conn, true);

    } catch (e) {
        m.reply("Error: " + e.message);
    }
};

handler.help = ["pin <url>"];
handler.tags = ["downloader"];
handler.command = /^pin$/i;

export default handler;