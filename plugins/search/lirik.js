let handler = async (m, { text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `Masukin lirik atau tema dong.\n\nContoh:\n${usedPrefix + command} jika kamu mendua`
    )

  await global.wait(m, conn)

  try {
    const url = 'https://lyricsgenerator.com/api/completion'
    const payload = { prompt: text }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'text/plain;charset=UTF-8',
        origin: 'https://lyricsgenerator.com',
        referer: 'https://lyricsgenerator.com',
        'user-agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('API ngambek')

    const lyrics = await res.text()

    if (!lyrics) throw 'Liriknya nihil, hampa, kosong'

    await m.reply(`🎵 *Hasil Lirik*\n\n${lyrics}`)
  } catch (e) {
    m.reply(`❌ Gagal generate lirik.\n${e.message || e}`)
  }

  await global.wait(m, conn, true)
}

handler.help = ['lirikgen <tema>']
handler.tags = ['ai']
handler.command = /^(lirikgen|genlirik)$/i

export default handler