import fs from 'fs'

const DOMAIN = 'https://panel.darma.dpdns.org'
const API_KEY = 'ptla_6T9OQOg6T9NyL72098rWaZQp2Zl8sENvwUr5vnkgqZd'

let handler = async (m, { conn, text, command, usedPrefix }) => {

  if (!text) {
    return m.reply(`*Format salah!*
Penggunaan:
${usedPrefix + command} username
(reply / mention / nomor opsional)`)
  }

  let username = text.split(',')[0].trim()

  let u =
    m.quoted?.sender ||
    m.mentionedJid?.[0] ||
    (text.split(',')[1]
      ? text.split(',')[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      : null)

  if (!u) {
    return m.reply(
      'reply chat / mention user / ketik nomor\ncontoh: .1gb user,628xxx'
    )
  }
  
  let cek = []
  if (!cek || !cek[0]?.jid) {
  	console.log('onWhatsApp failed, lanjut pakai jid asli:', u)
	}
	
  let egg = 15
  let loc = 1

  let memo = 1050
  let cpu = 30
  let disk = 1050

  let email = `${username}1398@gmail.com`
  let password = `${username}001`

  try {
    // CREATE USER
    let f = await fetch(`${DOMAIN}/api/application/users`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + API_KEY
      },
      body: JSON.stringify({
        email,
        username,
        first_name: username,
        last_name: username,
        language: 'en',
        password
      })
    })

    let data = await f.json()
    if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2))

    let user = data.attributes

    await conn.sendMessage(
      u,
      {
        image: fs.readFileSync('./data/image/thumb.jpg'),
        caption: `Hai @${u.split('@')[0]}

👤 USERNAME : ${user.username}
🔐 PASSWORD : ${password}
🌐 LOGIN : ${DOMAIN}`
      },
      { mentions: [u] }
    )

    let f3 = await fetch(`${DOMAIN}/api/application/servers`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + API_KEY
      },
      body: JSON.stringify({
        name: username,
        user: user.id,
        egg,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        startup: '/usr/local/bin/${CMD_RUN}',
        environment: { CMD_RUN: 'npm start' },
        limits: { memory: memo, disk, cpu, swap: 0, io: 500 },
        feature_limits: { databases: 5, backups: 5, allocations: 1 },
        deploy: { locations: [loc], dedicated_ip: false, port_range: [] }
      })
    })

    let res = await f3.json()
    if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))

    m.reply('✅ user + server berhasil dibuat')
  } catch (e) {
    console.error(e)
    m.reply('gagal, cek api / panel')
  }
}

handler.command = /^1gb$/i
handler.tags = ['owner']
handler.help = ['1gb username']
handler.owner = true

export default handler