import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import yts from "yt-search";
import convert from "../../lib/toAll.js";

const execPromise = promisify(exec);
const TMP_DIR = path.join(process.cwd(), "tmp");

async function ensureTmp() {
    try {
        await fs.mkdir(TMP_DIR);
    } catch {}
}

// Normalisasi URL playlist radio dan link mobile
function fixUrl(url) {
    if (!url) return "";
    url = url.replace("https://m.youtube.com", "https://www.youtube.com");
    url = url.split("&list=")[0];
    url = url.split("&start_radio=")[0];
    url = url.split("&pp=")[0];
    return url;
}

// Skip link radio playlist dari hasil yts
async function pickValidVideo(query) {
    const { all } = await yts(query);

    for (let vid of all) {
        let url = fixUrl(vid.url);

        // test metadata, kalo unavailable langsung skip
        try {
            await getMetadata(url);
            return url;
        } catch {
            continue;
        }
    }

    return null;
}

function sanitizeFileName(name) {
    return encodeURIComponent(name)
        .replace(/%20/g, "_")
        .replace(/\*/g, "")
        .replace(/%/g, "");
}

async function getMetadata(url) {
    try {
        const { stdout } = await execPromise(`./yt-dlp --dump-json "${url}"`);
        return JSON.parse(stdout);
    } catch {
        const { stdout } = await execPromise(`./yt-dlp --cookies ./cookies.txt --dump-json "${url}"`);
        return JSON.parse(stdout);
    }
}

function formatNumber(num) {
    if (!num || isNaN(num)) return "0";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
}

function convertMeta(meta) {
    return {
        title: meta.title || "",
        author: { channelTitle: meta.channel || meta.uploader || "" },
        thumbnail: meta.thumbnail || (meta.thumbnails?.slice(-1)[0]?.url || ""),
        metadata: {
            jadwal_upload: meta.upload_date || "",
            like: formatNumber(meta.like_count || 0),
            comment: formatNumber(meta.comment_count || 0),
            duration: meta.duration_string || (
                meta.duration ? `${Math.floor(meta.duration / 60)}:${(meta.duration % 60).toString().padStart(2, "0")}` : ""
            )
        },
        url: meta.webpage_url || ""
    };
}

async function safeUnlink(file) {
    try {
        await fs.unlink(file);
    } catch {}
}

async function ytdlAuto(url, format = "360") {
    const supported = ["360", "720", "1080", "mp3"];
    if (!supported.includes(format)) throw new Error("Format tidak valid!");

    await ensureTmp();

    const meta = await getMetadata(url);
    let safeTitle = sanitizeFileName(meta.title || `ytdl_${Date.now()}`);

    if (safeTitle.length > 200) safeTitle = `ytdl_${Date.now()}`;

    const outFile = path.join(TMP_DIR, `${safeTitle}.%(ext)s`);

    let baseCmd = "";
    let cookieCmd = "";

    if (format === "mp3") {
        baseCmd = `./yt-dlp --extractor-args "youtube:player_client=default" -x --audio-format mp3 -o "${outFile}" "${url}"`;
        cookieCmd = `./yt-dlp --cookies ./cookies.txt --extractor-args "youtube:player_client=default" -x --audio-format mp3 -o "${outFile}" "${url}"`;
    } else {
        const ytFormat = `bestvideo[height=${format}]+bestaudio/best[height=${format}]`;
        baseCmd = `./yt-dlp --extractor-args "youtube:player_client=default" -f "${ytFormat}" -o "${outFile}" "${url}"`;
        cookieCmd = `./yt-dlp --cookies ./cookies.txt --extractor-args "youtube:player_client=default" -f "${ytFormat}" -o "${outFile}" "${url}"`;
    }

    try {
        await execPromise(baseCmd);
    } catch {
        try {
            await execPromise(cookieCmd);
        } catch (e) {
            console.log(e);
            throw new Error("❌ VPS kamu diblokir YouTube atau cookies invalid.");
        }
    }

    const files = await fs.readdir(TMP_DIR);
    const found = files.find(f => f.startsWith(safeTitle));

    if (!found) throw new Error("File download tidak ditemukan!");

    const filePath = path.join(TMP_DIR, found);
    const buffer = await fs.readFile(filePath);

    await safeUnlink(filePath);

    return {
        ...convertMeta(meta),
        buffer,
        filename: decodeURIComponent(found)
    };
}

// Handler PLAYCH
let Izumi = async (m, { conn, text }) => {
    const oota = await conn.sendMessage(
        m.chat,
        { text: "⏳ Tunggu... Sedang mengambil lagu via yt-dlp..." },
        { quoted: m }
    );

    try {
        if (!text) return m.reply("⚠️ Masukkan nama lagu yang ingin dicari.");

        // Cari video valid (bukan radio playlist)
        const goodUrl = await pickValidVideo(text);

        if (!goodUrl) {
            await conn.sendMessage(m.chat, { text: "❌ Tidak ada video valid yang bisa di-download.", edit: oota.key });
            return;
        }

        const play = await ytdlAuto(goodUrl, "mp3");
        const toBuffer = play.buffer;

        if (toBuffer.length > 50 * 1024 * 1024) {
            await conn.sendMessage(m.chat, { text: "📄 File terlalu besar untuk dikirim.", edit: oota.key });
            return;
        }

        await conn.sendMessage(m.chat, { text: "☘️ File siap, mengirim...", edit: oota.key });

        await sendWhatsAppVoice(conn, m.chat, toBuffer, {
            fileName: play.filename,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1,
                isForwarded: true,
                externalAdReply: {
                    title: play.title + " / " + play.author.channelTitle,
                    body: "Request dari: " + m.pushName,
                    mediaType: 1,
                    thumbnailUrl: play.thumbnail,
                    sourceUrl: global.web,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (e) {
        await conn.sendMessage(m.chat, {
            text: "❌ Gagal mengambil lagu. Server YouTube atau IP VPS lagi ngaco.",
            edit: oota.key
        });
        console.error("Error", e);
    }
};

async function toWhatsAppVoice(inputBuffer) {
    const audioBuffer = await convert.toVN(inputBuffer);
    const waveform = await convert.generateWaveform(audioBuffer);
    return { audio: audioBuffer, waveform };
}

async function sendWhatsAppVoice(conn, chatId, inputBuffer, options = {}, options2 = {}) {
    try {
        const { audio, waveform } = await toWhatsAppVoice(inputBuffer);

        await conn.sendMessage(
            chatId,
            {
                audio,
                waveform,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                ...options,
            },
            { ...options2 }
        );

    } catch (err) {
        console.error("Failed to send voice:", err);
    }
}

Izumi.command = /^(playch|musich|musikch)$/i;
Izumi.help = ["playch", "musich", "musikch"];
Izumi.tags = ["downloader"];
Izumi.owner = true;

export default Izumi;