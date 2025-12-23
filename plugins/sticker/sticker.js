import sticker from "../../lib/sticker.js";

let Izumi = async (m, { conn }) => {
  const q = m.quoted || m;
  const mime = q.mimetype || q.msg?.mimetype || "";

  if (!mime)
    return m.reply("⚠️ Masukan gambar atau video buat sticker!");

  const buffer = await q.download();

  const exif = {
    packName: `Stiker by ${global.botname}`,
  };

  // IMAGE
  if (/image\/(jpe?g|png|webp)/i.test(mime)) {
    const stik = await sticker.writeExif({ data: buffer }, exif);
    return conn.sendMessage(m.chat, { sticker: stik }, { quoted: m });
  }

  // VIDEO
  if (/video\/(mp4|webm|gif)/i.test(mime)) {
    if ((q.seconds || 0) > 10)
      return m.reply("⚠️ Video maksimal 10 detik!");

    const stik = await sticker.writeExif({ data: buffer }, exif);
    return conn.sendMessage(m.chat, { sticker: stik }, { quoted: m });
  }

  return m.reply("⚠️ Format tidak didukung. Kirim image atau video.");
};

Izumi.command = /^(s|sticker|stiker)$/i;
Izumi.help = ["s", "sticker", "stiker"];
Izumi.tags = ["sticker"];
Izumi.limit = true;

export default Izumi;