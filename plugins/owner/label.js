// Plugin set nametag / label (owner only)

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text)
    return m.reply(`Example:\n${usedPrefix + command} Orang Sikma`)

  const loading = await conn.sendMessage(
    m.chat,
    { text: '*Loading...*' },
    { quoted: m }
  )

  try {
    await conn.relayMessage(
      m.chat,
      {
        protocolMessage: {
          type: 30,
          memberLabel: {
            label: text,
            labelTimestamp: Date.now(),
          },
        },
      },
      {}
    )

    await conn.sendMessage(m.chat, {
      edit: loading.key,
      text: '*Label successfully applied!*',
    })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      edit: loading.key,
      text: String(e),
    })
  }
}

handler.help = ['label <text>']
handler.tags = ['owner']
handler.command = /^(label|setlabel)$/i
handler.owner = true

export default handler