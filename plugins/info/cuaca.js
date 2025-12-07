let handler = async (m, { text, command }) => {
  if (!text) return m.reply(`mana lokasinya?`);

  try {
  	await global.wait( m, conn)
    let q = encodeURIComponent(text);
    let url = `https://api.ootaizumi.web.id/lokasi/cuaca?lokasi=${q}`;

    let res = await fetch(url);
    if (!res.ok) throw await res.text();
    let json = await res.json();

    if (!json.status) return m.reply("Tempatnya gak ketemu. Coba ketik lokasi yang jelas.");

    let r = json.result;
    
    let peringatan = "";
    if (r.peringatan && (r.peringatan.dampak?.length || r.peringatan.deskripsi)) {
		  peringatan = `
⚠️  *Peringatan Dini*
		  
${r.peringatan.dampak?.length ? r.peringatan.dampak.map(v => "• " + v).join("\n") : "• Tidak ada peringatan"}
		
${r.peringatan.deskripsi ? `\n_${r.peringatan.deskripsi}_` : ""}
		`;
		}
    
    let teks = `
┌───────────────────────┐
│   L A P O R A N  C U A C A
└───────────────────────┘

🏙️  *Wilayah*
• Desa        : ${r.lokasi.desa}
• Kecamatan   : ${r.lokasi.kecamatan}
• Kabupaten   : ${r.lokasi.kotkab}
• Provinsi    : ${r.lokasi.provinsi}

🕒  *Waktu Pengamatan*
• ${r.cuaca.waktu} WIB

🌦️  *Kondisi Cuaca*
• Deskripsi   : ${r.cuaca.deskripsi}
• Suhu        : ${r.cuaca.suhu}
• Kelembapan  : ${r.cuaca.kelembapan}
• Tutupan Awan: ${r.cuaca.tutupanAwan}

🌬️  *Angin*
• Arah        : ${r.cuaca.angin.dari} → ${r.cuaca.angin.ke}
• Kecepatan   : ${r.cuaca.angin.kecepatan}

👁️  *Jarak Pandang*
• ${r.cuaca.jarakPandang.teks} (${r.cuaca.jarakPandang.meter} m)

${peringatan}


_*sumber*_
> Maps : ${r.url.gmaps}
> BMKG : ${r.url.bmkg}
`;

    m.reply(teks);

  } catch (err) {
    console.error(err);
    m.reply("Cuacanya lagi error atau servernya lagi ngambek.");
  }
  await global.wait( m, conn, true)
};

handler.help = ["cuaca <lokasi>"];
handler.tags = ["info"];
handler.command = /^cuaca$/i;

export default handler;