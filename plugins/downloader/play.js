import convert from "../../lib/toAll.js";

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0])
        return m.reply(`Masukkan judul lagu.\nContoh: ${usedPrefix + command} Hanyut`);

    await global.wait(m, conn);

    try {
        const query = args.join(" ");
        const result = await play(query);

        if (!result.success) throw new Error(result.error);

        const { title, channel, cover, url, downloadUrl } = result;

        const audioRes = await fetch(downloadUrl);
        if (!audioRes.ok) throw new Error(`Gagal mengambil audio (${audioRes.status})`);

        const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

        const converted = await convert.toVN(audioBuffer); // gunakan toAll.js dengan format VN
        const waveform = await convert.generateWaveform(converted);

        await conn.sendMessage(
            m.chat,
            {
                audio: converted,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                waveform,
                contextInfo: {
                    externalAdReply: {
                        title,
                        body: channel,
                        thumbnailUrl: cover,
                        mediaUrl: url,
                        mediaType: 2,
                        renderLargerThumbnail: true,
                    },
                },
            },
            { quoted: m }
        );
    } catch (e) {
        conn.logger?.error?.(e);
        m.reply(`❌ Error: ${e.message}`);
    } finally {
        await global.wait(m, conn, true);
    }
};

handler.help = ["play"];
handler.tags = ["downloader"];
handler.command = /^(play)$/i;

export default handler;

/* ===================================== */
/*            PLAY FUNCTION              */
/* ===================================== */

async function play(query) {
    const encoded = encodeURIComponent(query.trim());

    const endpoints = [
        `https://api.nekolabs.web.id/downloader/youtube/play/v1?q=${encoded}`,
        `https://api.ootaizumi.web.id/downloader/youtube-play?query=${encoded}`,
        `https://anabot.my.id/api/download/playmusic?query=${encoded}&apikey=freeApikey`,
        `https://api.elrayyxml.web.id/api/downloader/ytplay?q=${encoded}`,
    ];

    for (const endpoint of endpoints) {
        const res = await fetch(endpoint).catch(() => null);
        if (!res) continue;

        let json;
        try {
            json = await res.json();
        } catch {
            continue;
        }

        if (!json) continue;

        // nekolabs
        if (json.result?.downloadUrl && json.result?.metadata) {
            const { title, channel, cover, url } = json.result.metadata;
            return {
                success: true,
                title,
                channel,
                cover,
                url,
                downloadUrl: json.result.downloadUrl,
            };
        }

        // ootaizumi
        if (json.result?.download && json.result?.title) {
            return {
                success: true,
                title: json.result.title,
                channel: json.result.author?.name || "Unknown Channel",
                cover: json.result.thumbnail,
                url: json.result.url || null,
                downloadUrl: json.result.download,
            };
        }

        // anabot
        const ana = json.data?.result;
        if (ana?.success && ana?.urls && ana?.metadata) {
            return {
                success: true,
                title: ana.metadata.title,
                channel: ana.metadata.channel,
                cover: ana.metadata.thumbnail,
                url: ana.metadata.webpage_url || null,
                downloadUrl: ana.urls,
            };
        }

        // elray
        const elray = json.result;
        if (
            elray?.download_url &&
            elray?.title &&
            elray?.channel &&
            elray?.thumbnail &&
            elray?.url
        ) {
            return {
                success: true,
                title: elray.title,
                channel: elray.channel,
                cover: elray.thumbnail,
                url: elray.url,
                downloadUrl: elray.download_url,
            };
        }
    }

    return { success: false, error: "Tidak ditemukan audio dari penyedia mana pun." };
}