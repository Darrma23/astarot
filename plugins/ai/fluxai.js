import up from "../../lib/uploader.js";

let handler = async (m, { conn, text }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";

  if (!mime.startsWith("image/")) {
    return m.reply("❌ Kirim atau reply gambar terlebih dahulu!");
  }

  if (!text) {
    return m.reply("❌ Masukkan prompt!\n\nContoh: .fluxkontext to ghibli style art");
  }

  await global.wait(m, conn);

  try {
    const buff = await q.download();

    // FIX DI SINI — pilih uploader yang bener!
    const imageUrl = await up.catbox(buff);

    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error("Uploader tidak mengembalikan URL string.");
    }

    const url =
      `https://api.nekolabs.web.id/image-generation/flux/kontext/v2` +
      `?prompt=${encodeURIComponent(text)}` +
      `&imageUrl=${encodeURIComponent(imageUrl)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const json = await response.json();
    if (!json.result) throw new Error("Response API tidak valid");

    await conn.sendMessage(
      m.chat,
      {
        image: { url: json.result },
        caption: `✅ *Flux Kontext AI*\n\n📝 Prompt: ${text}`
      },
      { quoted: m }
    );
  } catch (e) {
    console.error("Error:", e);
    m.reply(`❌ Terjadi kesalahan:\n${e.message}`);
  }

  await global.wait(m, conn, true);
};

handler.help = ["fluxkontext <prompt>"];
handler.tags = ["ai"];
handler.command = ["fluxkontext", "fk", "editimg"];

export default handler;