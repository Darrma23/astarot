let handler = async (m, { conn }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Owner Darma
ORG:Owner Darma
TITLE:Epictetus, Enchiridion — Chapter 1 (verse 1)
EMAIL;type=INTERNET: noisyboyss887@gmail.com
TEL;type=CELL;waid=6281933732553:+6281933732553
ADR;type=WORK:;;2-chōme-7-5 Fuchūchō;Izumi;Osaka;594-0071;Japan
URL;type=WORK:https://www.instagram.com/darrma23
X-WA-BIZ-NAME:Owner Darma
X-WA-BIZ-DESCRIPTION:𝙊𝙬𝙣𝙚𝙧 𝙊𝙛 𝘼𝙨𝙩𝙖𝙧𝙤𝙩 𝙎𝙘𝙧𝙞𝙥𝙩
X-WA-BIZ-HOURS:Mo-Su 00:00-23:59
END:VCARD`;

    const q = {
        key: {
            fromMe: false,
            participant: "13135550002@s.whatsapp.net",
            remoteJid: "status@broadcast",
        },
        message: {
            contactMessage: {
                displayName: "Owner Darma",
                vcard,
            },
        },
    };

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: "Owner Darma",
                contacts: [{ vcard }],
            },
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363144038483540@newsletter",
                    newsletterName: "Paduka Owner Astarot",
                },
                externalAdReply: {
                    title: "© 2024–2025 Astarot Project",
                    body: "Contact the Owner via WhatsApp",
                    thumbnailUrl: "https://files.catbox.moe/riml9y.jpg",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        },
        { quoted: q }
    );
};

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = /^(owner|creator)$/i;

export default handler;