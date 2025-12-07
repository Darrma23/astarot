let handler = async (m, { conn, usedPrefix, command, text }) => {
    await global.wait(m, conn);

    // input wajib
    let prompt = text?.trim();
    if (!prompt) {
        return m.reply(
            `mana promtnya?`
        );
    }

    const base = "https://api.nekolabs.web.id/text-generation/ai4chat";
    const params = new URLSearchParams({ text: prompt });
    const url = `${base}?${params.toString()}`;

    let result = "Terjadi kesalahan.";
    try {
        let res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

        let json = await res.json();
        if (!json.success) throw new Error(json.message || "unknown response");

        result = json.result;
    } catch (err) {
        result = `❌ Error: ${err.message}`;
    }

    await m.reply(result);
    await global.wait(m, conn, true);
};

handler.help = ["ai"];
handler.tags = ["ai"];
handler.command = /^(ai)$/i;

export default handler;