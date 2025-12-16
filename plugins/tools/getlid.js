import but from "baileys_helper";

let handler = async (m, { conn, text }) => {
    try {
        // ===== AMBIL TARGET =====
        const quotedSender =
            m.quoted && !m.quoted.fromMe ? m.quoted.sender : null;

        const input =
            m.mentionedJid?.[0] ||
            quotedSender ||
            (text && /^\d+$/.test(text) ? text + "@s.whatsapp.net" : null) ||
            m.sender;

        if (!input) {
            throw new Error("Masukkan nomor, mention, atau reply user.");
        }

        // ===== AMBIL LID =====
        let lid;
        if (/@lid$/.test(input)) {
            lid = input.replace(/@lid$/, "");
        } else {
            const raw = await conn.signalRepository.lidMapping.getLIDForPN(input);
            if (!raw) throw new Error("LID tidak ditemukan untuk user ini.");
            lid = raw.replace(/@lid$/, "");
        }

        const buttons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "📋 Copy LID",
                    copy_code: lid
                })
            }
        ];

        await but.sendInteractiveMessage(
            conn,
            m.chat,
            {
                text: "✅ LID ditemukan",
                footer: "Tap tombol untuk menyalin",
                interactiveButtons: buttons
            },
            { quoted: m }
        );
 
    } catch (e) {
        conn.logger?.error?.(e);
        await m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ["getlid"];
handler.tags = ["tools"];
handler.command = /^getlid$/i;
handler.limit = true;

export default handler;