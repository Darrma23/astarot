let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text)
            return m.reply(
                `Masukkan pertanyaanmu.\n› Contoh: ${usedPrefix + command} Apa itu Kecerdasan Buatan?`
            );

        await global.wait(m, conn);

        // start runtime
        const start = performance.now();

        const apiUrl = `https://api.ootaizumi.web.id/ai/gemini?text=${encodeURIComponent(text)}&sesi=libie`;
        const response = await fetch(apiUrl);

        if (!response.ok) return m.reply("Request gagal. Silakan coba lagi nanti.");

        const json = await response.json();

        // format baru:
        // { status: true, message: "jawaban..." }
        if (!json.status || !json.message)
            return m.reply("Tidak ada respons dari API.");

        const reply = json.message.trim();

        // end runtime
        const end = performance.now();
        const runtime = ((end - start) / 1000).toFixed(2);

        await conn.sendMessage(
            m.chat,
            {
                text: reply,
                contextInfo: {
                    externalAdReply: {
                        title: global.botname,
                        body: '',
                        thumbnailUrl: "https://qu.ax/zcLin.jpg",
                        sourceUrl: " ",
                        renderLargerThumbnail: false
                    }
                }
            },
            { quoted: m }
        );

    } catch (e) {
        conn.logger.error(e);
        m.reply(`Terjadi error: ${e.message}`);
    } finally {
        await global.wait(m, conn, true);
    }
};

handler.help = ["ai"];
handler.tags = ["ai"];
handler.command = /^(ai|openai)$/i;

export default handler;