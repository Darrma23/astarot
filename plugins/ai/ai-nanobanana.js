// PLUGIN: nanobanana
// TYPE: EDITOR IMAGE
// AUTHOR: kamu yang minta, aku yang capek 🙂

import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import up from "../../lib/uploader.js";

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        if (!text) return m.reply(`⚠️ Contoh:\n${usedPrefix + command} ubah warna kulit`);

        // ambil media dari reply atau pesan user sendiri
        const q = m.quoted ? m.quoted : m;
        const mime = q?.msg?.mimetype || q?.mimetype || "";

        if (!/image/.test(mime)) {
            return m.reply(`⚠️ Reply Gambar / Kirim Gambar + Caption untuk ${usedPrefix + command}`);
        }
        await global.wait(m, conn);

        const media = await q.download();
        const tmp = await up.tempfiles(media);

        // proses edit pakai nanobanana
        const buffer = await nanobanana(text, media);

        // upload output kalau lo mau kirim sebagai URL
        const out = await up.tempfiles(buffer);

        await conn.sendMessage(
            m.chat,
            {
                image: buffer,
                caption: `🎨 Edit Selesai\n📝 Prompt: ${text}\n🔗 Url: ${out}`
            },
            { quoted: m }
        );

    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
        console.error(e);
    }
    await global.wait(m, conn, true);
};

handler.help = handler.command = ["editfoto", "editimg"];
handler.tags = ["tools"];
handler.limit = true;

export default handler;


async function nanobanana(prompt, image) {
    try {
        if (!prompt) throw new Error('Prompt is required.');
        if (!Buffer.isBuffer(image)) throw new Error('Image must be a buffer.');
        
        const inst = axios.create({
            baseURL: 'https://nanobananas.pro/api',
            headers: {
                origin: 'https://nanobananas.pro',
                referer: 'https://nanobananas.pro/editor',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
        
        const { data: up } = await inst.post('/upload/presigned', {
            filename: `${Date.now()}_rynn.jpg`,
            contentType: 'image/jpeg'
        });
        
        if (!up?.data?.uploadUrl) throw new Error('Upload url not found.');
        await axios.put(up.data.uploadUrl, image);
        
        const { data: cf } = await axios.post('https://api.nekolabs.web.id/tools/bypass/cf-turnstile', {
            url: 'https://nanobananas.pro/editor',
            siteKey: '0x4AAAAAAB8ClzQTJhVDd_pU'
        });
        
        if (!cf?.result) throw new Error('Failed to get cf token.');
        
        const { data: task } = await inst.post('/edit', {
            prompt: prompt,
            image_urls: [up.data.fileUrl],
            image_size: 'auto',
            turnstileToken: cf.result,
            uploadIds: [up.data.uploadId],
            userUUID: crypto.randomUUID(),
            imageHash: crypto.createHash('sha256').update(image).digest('hex').substring(0, 64)
        });
        
        if (!task?.data?.taskId) throw new Error('Task id not found.');
        
        while (true) {
            const { data } = await inst.get(`/task/${task.data.taskId}`);
            if (data?.data?.status === 'completed') return data.data.result;
            await Bun.sleep(1000);
        }
    } catch (error) {
        throw new Error(error.message);
    }
}