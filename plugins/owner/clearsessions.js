import fs from "fs";
import path from "path";

// fungsi bersih-bersih tanpa kirim pesan
function cleanSessionsSilent() {
    try {
        const dir = path.join(process.cwd(), "sessions");
        if (!fs.existsSync(dir)) return 0;

        const files = fs.readdirSync(dir);
        let del = 0;

        for (let f of files) {
            // file penting WA, jangan disentuh
            if (
                f === "creds.json" ||
                f.includes("app-state") ||
                f.includes("critical") ||
                f.includes("sender-key-memory") ||
                (f.startsWith("session-") && f.endsWith(".json"))
            ) continue;

            // pre-key, sender-key, atau json sampah
            if (
                f.startsWith("pre-key-") ||
                f.startsWith("sender-key-") ||
                f.endsWith(".json")
            ) {
                fs.unlinkSync(path.join(dir, f));
                del++;
            }
        }
        return del;
    } catch {
        return 0;
    }
}

let handler = async (m) => {
    const jumlah = cleanSessionsSilent();
    await m.reply(`🧹 *Session dibersihkan*\nTotal file dihapus: ${jumlah}`);
};

handler.help = ["clearsession"];
handler.tags = ["owner"];
handler.command = /^clearsession$/i;
handler.owner = true;

// AUTO CLEAN SETIAP 1 JAM
setInterval(() => {
    const total = cleanSessionsSilent();
    if (total > 0) {
        console.log(`🧹 Auto-clean: ${total} file session dihapus`);
    }
}, 60 * 60 * 1000); // 1 jam = 3600000 ms

export default handler;