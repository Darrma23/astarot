import axios from "axios";
import { Sticker } from "wa-sticker-formatter";

let izuku = async (m, { conn, text }) => {
  if (!text) throw " *[ ! ]* Masukan teksnya.";

  await global.wait(m, conn);

  try {
    const api = "https://api.nekolabs.web.id/canvas/brat/v1";

    const res = await axios.get(api, {
      params: { text },
      responseType: "arraybuffer"
    });

    const buffer = Buffer.from(res.data);

    const sticker = new Sticker(buffer, {
      pack: "Brat Sticker",
      author: global?.botname ?? "Bot",
      type: "full",
      quality: 90
    });

    const stickerFinal = await sticker.toBuffer();

    await conn.sendMessage(
      m.chat,
      { sticker: stickerFinal },
      { quoted: m }
    );

  } catch (err) {
    console.error("brat error:", err);
    throw " *[ ! ]* Server error atau API limit. Coba lagi nanti.";
  } finally {
    await global.wait(m, conn, true);
  }
};

izuku.help = ["brat", "bratgenerator"];
izuku.tags = ["sticker"];
izuku.command = /^(brat|bratgenerator)$/i;
izuku.limit = true;

export default izuku;