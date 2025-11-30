import util from "util";

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Teksnya mana, Dar?");
	await global.wait(m, conn);
  try {
    const axios = (await import("axios")).default;

    const apiURL = "https://astarot-api.vercel.app/tools/text-to-speech";

    const res = await axios.get(apiURL, {
      params: {
        text,
        voice_id: "67ae0979-5d4b-11ee-a861-00163e2ac61b" // Nahida
      }
    });

    const data = res.data;

    if (!data || !data.result) return m.reply("API kamu kosong, Dar.");

    // ambil voice Nahida aja
    const nahidaObj = data.result.find(v => v?.nahida);
    if (!nahidaObj) return m.reply("Voice Nahida gak ketemu.");

    const audioUrl = nahidaObj.nahida;
    if (!audioUrl) return m.reply("Link audio Nahida gak ada.");

    // Kirim sebagai VN (opus)
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/ogg; codecs=opus",
        ptt: true // ini biar jadi bentuk VN
      },
      { quoted: m }
    );

  } catch (e) {
    console.log(e);
    m.reply("Error: " + util.format(e));
  }
  await global.wait(m, conn, true);
};

handler.help = ["tts <teks>"];
handler.tags = ["tools"];
handler.command = /^tts$/i;

export default handler;