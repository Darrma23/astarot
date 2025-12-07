/*
Fitur Copilot Think Deep
Note: AI Think Realtime
Req fitur? Tag saya:
https://chat.whatsapp.com/KxRm9Sb1HC7DniozVhqtvh?mode=hqrt1
*/

import axios from "axios";

const handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) {
      return m.reply(
        `Masukkan pertanyaan.\nContoh: *${usedPrefix + command} siapa kamu*`
      );
    }

    await global.wait(m, conn);

    const url = `https://api.yupra.my.id/api/ai/copilot-think?text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; YPBot)"
      }
    });

    if (!data?.status) throw new Error("API Error");

    const answer = data.result || "Tidak ada jawaban.";
    await m.reply(answer);

  } catch (e) {
    await conn.sendMessage(
      m.chat,
      { text: "Gagal memproses pertanyaan." },
      { quoted: m }
    );
  }

  await global.wait(m, conn, true);
};

handler.help = ["copilot"];
handler.tags = ["ai"];
handler.command = /^copilot$/i;

export default handler;