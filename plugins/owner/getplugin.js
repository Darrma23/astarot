import fs from 'fs'
import path from 'path'

let gp = async (m, { text }) => {
  try {
    if (!text) return m.reply('⚠️ Contoh: *.gp handler.js* atau *.gp plugins/downloader/play.js*')

    if (!text.endsWith('.js') && !text.endsWith('.cjs'))
      return m.reply('⚠️ File harus .js atau .cjs lah masa yang lain')

    const root = process.cwd()
    const filePath = path.join(root, text)

    if (!filePath.startsWith(root))
      return m.reply('⚠️ Jangan nakal… path keluar project tidak diizinkan')

    if (!fs.existsSync(filePath))
      return m.reply('⚠️ File tidak ditemukan!')

    const file = fs.readFileSync(filePath, 'utf-8')
    await m.reply(file)

  } catch (e) {
    console.log('Error:', e)
    m.reply('⚠️ Error ambil file, mungkin sudah dihapus?')
  }
}

gp.command = ['gp', 'getplugin']
gp.help = ['gp', 'getplugin']
gp.tags = ['owner']
gp.owner = true

export default gp