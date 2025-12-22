import * as baileys from "@adiwajshing/baileys";
import crypto from "node:crypto";
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";

let Izumi = async (m, { conn, text }) => {
  let [textInput, warna, url] = text.split("|");

  // ambil target grup
  let id;
  if (url) {
    const inviteCode = url.split("/").pop().split("?")[0];
    const info = await conn.groupGetInviteInfo(inviteCode);
    id = info.id;
  } else {
    id = m.chat;
  }

  // fallback quoted / message utama
  const quoted = m.quoted || m;
  const cap = quoted.caption || textInput;

  // ambil mime
  const mime = quoted?.mimetype || quoted?.msg?.mimetype || "";

  // === IMAGE ===
  if (/image/.test(mime)) {
    const buffer = await quoted.download().catch(() => null);
    if (!buffer) return m.reply("⚠️ Gagal ambil gambar!");

    const sta = await groupStatus(conn, id, {
      image: buffer,
      caption: "",
    });

    return conn.reply(m.chat, "✅ Dah UpStatus Nya Tengok Di Reply", sta);
  }

  // === VIDEO ===
  if (/video/.test(mime)) {
    const buffer = await quoted.download().catch(() => null);
    if (!buffer) return m.reply("⚠️ Gagal ambil video!");

    const sta = await groupStatus(conn, id, {
      video: buffer,
      caption: "",
    });

    return conn.reply(m.chat, "✅ Dah UpStatus Nya Tengok Di Reply", sta);
  }

  // === AUDIO ===
  if (/audio/.test(mime)) {
    const buffer = await quoted.download().catch(() => null);
    if (!buffer) return m.reply("⚠️ Gagal ambil audio!");

    const audioVn = await toVN(buffer);
    const audioWaveform = await generateWaveform(buffer);

    const sta = await groupStatus(conn, id, {
      audio: audioVn,
      waveform: audioWaveform,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    return conn.reply(m.chat, "✅ Dah UpStatus Nya Tengok Di Reply", sta);
  }

  // === TEXT BERWARNA ===
  if (warna) {
    if (!cap) {
      return m.reply("⚠️ Gada Text Buat Upload Ke Status Grup!");
    }

    const warnaStatusWA = new Map([
      ["biru", "#34B7F1"],
      ["hijau", "#25D366"],
      ["kuning", "#FFD700"],
      ["jingga", "#FF8C00"],
      ["merah", "#FF3B30"],
      ["ungu", "#9C27B0"],
      ["abu", "#9E9E9E"],
      ["hitam", "#000000"],
      ["putih", "#FFFFFF"],
      ["cyan", "#00BCD4"],
    ]);

    const textWarna = warna.toLowerCase();
    let color = null;

    for (const [nama, kode] of warnaStatusWA.entries()) {
      if (textWarna.includes(nama)) {
        color = kode;
        break;
      }
    }

    if (!color) {
      return m.reply("⚪ Tidak ada warna yang cocok ditemukan dalam teks kamu.");
    }

    const sta = await groupStatus(conn, id, {
      text: cap,
      backgroundColor: color,
    });

    return conn.reply(m.chat, "✅ Dah UpStatus Nya Tengok Di Reply", sta);
  }

  // === FALLBACK ===
  return m.reply(
	  "⚠️ Reply media (gambar/video/audio) lalu ketik .swgc\n" +
	  "Atau teks berwarna: .swgc teks | warna\n" +
	  "Bisa juga target grup lain pakai link GC"
	);
};

/**
 * Kirim status ke grup
 */
async function groupStatus(conn, jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;

  const inside = await baileys.generateWAMessageContent(content, {
    upload: conn.waUploadToServer,
    backgroundColor,
  });

  const messageSecret = crypto.randomBytes(32);

  const msg = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: { messageSecret },
      groupStatusMessageV2: {
        message: {
          ...inside,
          messageContextInfo: { messageSecret },
        },
      },
    },
    {}
  );

  await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
  return msg;
}

Izumi.help = ["swgc", "upswgc"];
Izumi.command = ["swgc", "upswgc"];
Izumi.tags = ["tools"];
Izumi.admin = true;

// === AUDIO CONVERTER ===
async function toVN(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough();
    const outStream = new PassThrough();
    const chunks = [];

    inStream.end(inputBuffer);

    ffmpeg(inStream)
      .noVideo()
      .audioCodec("libopus")
      .format("ogg")
      .audioBitrate("48k")
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions([
        "-map_metadata", "-1",
        "-application", "voip",
        "-compression_level", "10",
        "-page_duration", "20000",
      ])
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: true });

    outStream.on("data", c => chunks.push(c));
  });
}

// === WAVEFORM GENERATOR ===
async function generateWaveform(inputBuffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const chunks = [];

    ffmpeg(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", reject)
      .on("end", () => {
        const rawData = Buffer.concat(chunks);
        const samples = rawData.length / 2;

        const amplitudes = [];
        for (let i = 0; i < samples; i++) {
          const val = rawData.readInt16LE(i * 2);
          amplitudes.push(Math.abs(val) / 32768);
        }

        const blockSize = Math.floor(amplitudes.length / bars);
        const avg = [];

        for (let i = 0; i < bars; i++) {
          const block = amplitudes.slice(
            i * blockSize,
            (i + 1) * blockSize
          );
          avg.push(block.reduce((a, b) => a + b, 0) / block.length);
        }

        const max = Math.max(...avg);
        const normalized = avg.map(v => Math.floor((v / max) * 100));

        resolve(Buffer.from(new Uint8Array(normalized)).toString("base64"));
      })
      .pipe()
      .on("data", chunk => chunks.push(chunk));
  });
}

export default Izumi;