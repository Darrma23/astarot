import axios from 'axios';
import bu from '../../lib/sticker.js';

let izuku = async (m, { conn, text }) => {
  if (!text) throw ' *[ ! ]* Masukan Teks Nya !';
  // mulai loading / typing indicator
  await global.wait(m, conn);

  try {
    const url = `${global?.apikey?.izumi}/generator/brat`;
    const res = await axios.get(url, {
      params: { text },
      responseType: 'arraybuffer'
    });

    // res.data adalah ArrayBuffer / Buffer
    const buffer = res.data;

    const packName = `- Project ${global?.botname ?? 'Bot'} || Owner By: ${global?.ownername ?? 'Owner'} -`;
    const sticker = await bu.writeExif({ data: buffer }, { packName });

    // kirim sticker
    const sent = await conn.sendMessage(m.chat, { sticker }, { quoted: m });
    return sent;
  } catch (err) {
    console.error('izuku generator error:', err);
    // Pesan error yang lebih ramah pengguna
    throw ' *[ ! ]* Maaf, kemungkinan server sibuk atau batas request tercapai. Coba lagi nanti.';
  } finally {
    // hentikan loading / typing indicator
    await global.wait(m, conn, true);
  }
};

izuku.limit = true;
izuku.loading = true;

izuku.help = ['brat', 'bratgenerator'];
izuku.command = /^(brat|bratgenerator)$/i;
izuku.tags = ['sticker'];

export default izuku;