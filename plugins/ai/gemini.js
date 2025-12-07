let handler = async (m, { conn, usedPrefix, command, text }) => {
    await global.wait(m, conn);

    // prompt wajib ada
    let prompt = text?.trim();
    if (!prompt) {
        return m.reply('mana promtnya?');
    }

    // session
    let sessionId = "astarot-" + m.sender;

    // build params
    const params = new URLSearchParams();
    params.append("text", prompt);
    params.append("sessionId", sessionId);
    params.append(
        "systemPrompt",
        "kamu adalah astarot, asisten cerdas, jujur, dan membantu. kamu dibuat oleh Darma."
    );

    let url = `https://api.nekolabs.web.id/text-generation/gpt/5?${params.toString()}`;

    // fetch
    let result = "Terjadi kesalahan.";
    try {
        let res = await fetch(url);
        if (!res.ok) throw new Error(res.status + " " + res.statusText);

        let json = await res.json();
        if (!json.success) throw new Error(json.message || "unknown response");

        result = json.result;
    } catch (err) {
        result = `❌ Error: ${err.message}`;
    }

    await m.reply(result);
    await global.wait(m, conn, true);
};

handler.help = ["gemini"];
handler.tags = ["ai"];
handler.command = /^(gemini)$/i;

export default handler;