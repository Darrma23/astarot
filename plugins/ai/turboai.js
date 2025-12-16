/*
📌 Name : Turbo AI (Updated)
🏷️ Type : Plugin ESM
🔗 Base : https://theturbochat.com
👤 Creator : Hazel
✏️ Rework : Dar & ChatGPT (terpaksa)
*/

import axios from "axios";

const handler = async (m, { text, conn }) => {
    if (!text)
        throw "Masukin teksnya woi.\nContoh:\n.turboai halo kamu siapa";

    try {
        await conn.sendPresenceUpdate("composing", m.chat);

        const res = await axios.post(
            "https://theturbochat.com/chat",
            {
                message: text,
                model: "turbo", // biarin backend yang atur
                language: "id"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0"
                },
                timeout: 30_000
            }
        );

        const reply = res?.data?.choices?.[0]?.message?.content;

        if (!reply) throw "AI-nya diem, mungkin lagi capek";

        await conn.sendMessage(
            m.chat,
            { text: reply.trim() },
            { quoted: m }
        );

    } catch (e) {
        let err =
            e?.response?.data?.error ||
            e?.response?.data ||
            e?.message ||
            "Unknown error";

        await conn.sendMessage(
            m.chat,
            { text: `❌ Turbo AI error\n\n${err}` },
            { quoted: m }
        );
    }
};

handler.help = ["turboai <teks>"];
handler.tags = ["ai"];
handler.command = /^(turboai)$/i;
handler.limit = false;

export default handler;