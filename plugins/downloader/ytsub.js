/**
 * YTSUB Interactive
 * Step 1 → User kirim .ytsub <url>
 * Step 2 → Bot kirim pilihan resolusi
 * Step 3 → User pilih resolusi, bot kirim pilihan subtitle
 * Step 4 → User pilih subtitle, bot download video
 */

let Tio = async (m, { conn, text, usedPrefix, command }) => {
    const url = text.trim();

    if (!url || !/^https?:\/\/(m\.)?(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
        return m.reply(`Format salah.\nContoh:\n${usedPrefix + command} https://youtube.com/watch?v=bzpXVCqNCoQ`);
    }

    async function fetchJson(url, retries = 2) {
        for (let i = 0; i <= retries; i++) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return await res.json();
            } catch (e) {
                if (i === retries) throw new Error(`Gagal fetch ${url}: ${e.message}`);
            }
        }
    }

    try {
        await m.reply("⏳ Mengambil detail video...");

        const info = await fetchJson(
            `https://ytdlpyton.nvlgroup.my.id/info/?url=${encodeURIComponent(url)}`
        );

        const title = info.title || "Video";
        const resolutions = info.resolutions?.map(r => r.resolution) || [];
        const languages = info.subtitlelanguages || [];

        if (!resolutions.length) return m.reply("Resolusi tidak tersedia.");
        if (!languages.length) return m.reply("Subtitle tidak tersedia.");

        conn.ytsub = conn.ytsub || {};
        conn.ytsub[m.sender] = {
            url,
            title,
            resolutions,
            languages,
            step: "resolution"
        };

        const rows = resolutions.map(r => ({
            title: r + "p",
            description: "Klik untuk memilih resolusi",
            id: "ytsub_resolution_" + r
        }));

        await conn.relayMessage(
            m.chat,
            {
                interactiveMessage: {
                    header: {
                        title: "Pilih Resolusi",
                        subtitle: title,
                        hasMediaAttachment: false
                    },
                    body: { text: "Silakan pilih resolusi video:" },
                    footer: { text: "YouTube Subtitle Downloader" },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Resolusi Video",
                                    sections: [
                                        {
                                            title: "Pilihan Resolusi",
                                            highlight_label: "Video",
                                            rows
                                        }
                                    ]
                                })
                            }
                        ]
                    }
                }
            },
            {}
        );

    } catch (err) {
        console.error(err);
        m.reply("❌ Error: " + err.message);
    }
};

Tio.help = ['ytsub <url>'];
Tio.tags = ['downloader'];
Tio.command = /^(ytsub|ytsubtitle)$/i;
Tio.limit = true;

export default Tio;