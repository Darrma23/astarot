import but from "baileys_helper";

let handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const text = args[0];
        if (!text) {
            return m.reply(
                `Usage:\n${usedPrefix}cekid <WhatsApp group or channel link>`
            );
        }

        let url;
        try {
            url = new URL(text);
        } catch {
            return m.reply("❌ Format link tidak valid.");
        }

        const isGroup =
            url.hostname === "chat.whatsapp.com" &&
            /^\/[A-Za-z0-9]{20,}$/.test(url.pathname);

        const isChannel =
            url.hostname === "whatsapp.com" &&
            url.pathname.startsWith("/channel/");

        let id;

        if (isGroup) {
            const code = url.pathname.replace(/^\/+/, "");
            const res = await conn.groupGetInviteInfo(code);
            id = res?.id;
            if (!id) throw new Error("Gagal mengambil ID grup.");
        } else if (isChannel) {
            const code = url.pathname.split("/channel/")[1]?.split("/")[0];
            if (!code) throw new Error("Kode channel tidak ditemukan.");
            const res = await conn.newsletterMetadata("invite", code, "GUEST");
            id = res?.id;
            if (!id) throw new Error("Gagal mengambil ID channel.");
        } else {
            return m.reply("❌ Link tidak didukung.");
        }

        // ===== helper button copy (FORMAT SAMA KAYAK .tourl) =====
        const buttons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "📋 Copy ID",
                    copy_code: id
                })
            }
        ];

        await but.sendInteractiveMessage(
            conn,
            m.chat,
            {
                text: "✅ ID ditemukan",
                footer: "Tap tombol untuk menyalin",
                interactiveButtons: buttons
            },
            { quoted: m }
        );

    } catch (e) {
        conn?.logger?.error?.(e);
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ["cekid"];
handler.tags = ["tools"];
handler.command = /^(cekid|id)$/i;
handler.limit = true;

export default handler;