/**
  ╔══════════════════════
        ⧉  [fakektp] — [maker]
 ╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ API      : [ https://theresapisv3.vercel.app ]
  ✺ Req     : Z7 (Theresa ex Apocalypse)
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`*Contoh penggunaan:*\n${usedPrefix + command} provinsi|kota|nik|nama|ttl|jenis_kelamin|golongan_darah|alamat|rt/rw|kelurahan|kecamatan|agama|status|pekerjaan|kewarganegaraan|masa_berlaku|terbuat|photo_url\n\n*Format contoh:*\n${usedPrefix + command} Jakarta|Jakarta Timur|31752331637393|Reyz|24-04-2008 Jakarta|laki-laki|AB|jalan bahagia|08/06|Tengah|Kramat jati|Islam|belum menikah|manajer|Indonesia|seumur hidup|21-12-2025|https://cdn.yupra.my.id/yp/vi1275ok.png`);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const params = text.split('|');
        if (params.length < 18) {
            return m.reply(`*🍂 Parameter kurang!*\n\nDibutuhkan *18 parameter*, tetapi hanya menerima *${params.length}*.\n*Pastikan urutan parameter sesuai contoh!*`);
        }

        const baseURL = 'https://theresapisv3.vercel.app/canvas/ektp';
        const query = new URLSearchParams({
            provinsi: params[0].trim(),
            kota: params[1].trim(),
            nik: params[2].trim(),
            nama: params[3].trim(),
            ttl: params[4].trim(),
            jenis_kelamin: params[5].trim(),
            golongan_darah: params[6].trim(),
            alamat: params[7].trim(),
            'rt/rw': params[8].trim(),
            'kel/desa': params[9].trim(),
            kecamatan: params[10].trim(),
            agama: params[11].trim(),
            status: params[12].trim(),
            pekerjaan: params[13].trim(),
            kewarganegaraan: params[14].trim(),
            masa_berlaku: params[15].trim(),
            terbuat: params[16].trim(),
            pas_photo: params[17].trim()
        });

        const url = `${baseURL}?${query.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`*🍂 Gagal mengambil gambar!*\n*Status server:* ${response.status} ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        await conn.sendMessage(m.chat, {
            image: Buffer.from(buffer)
        }, { quoted: m });

    } catch (error) {
        m.reply(`*🍂 Terjadi kesalahan!*\n\n*Pesan error:* ${error.message}\n*Tips:* Periksa kembali URL foto atau koneksi internet Anda.`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['fakektp'];
handler.tags = ['tools'];
handler.command = /^(fakektp)$/i;
handler.limit = true;

export default handler;