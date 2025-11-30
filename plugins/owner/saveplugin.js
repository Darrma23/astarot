import fs from 'fs'
import path from 'path'

let sp = async (m, { text }) => {
  try {
    if (!text) return m.reply('⚠️ Contoh: *.sp plugins/downloader/play.js* (reply dengan isi file)')
    if (!m.quoted || !m.quoted.text) return m.reply('⚠️ Harus reply ke pesan yang berisi kode plugin!')

    const filePath = text.trim()
    const fileContent = m.quoted.text

    if (!filePath.endsWith('.js') && !filePath.endsWith('.cjs'))
      return m.reply('⚠️ Nama file harus diakhiri .js atau .cjs')

    const root = process.cwd()
    const fullPath = path.join(root, filePath)

    if (!fullPath.startsWith(root))
      return m.reply('⚠️ Path keluar project tidak boleh, mau ngapain kamu 😑')

    const dir = path.dirname(fullPath)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(fullPath, fileContent, 'utf-8')

    await m.reply(`✅ File *${filePath}* berhasil disimpan!\n📁 Lokasi: ${fullPath}`)
    console.log(`Plugin saved: ${fullPath}`)

  } catch (e) {
    console.log('Error Save Plugin:', e)
    m.reply('❌ Gagal menyimpan file, cek lagi formatnya.')
  }
}

sp.command = ['sp', 'saveplugin']
sp.help = ['sp', 'saveplugin']
sp.tags = ['owner']
sp.owner = true

export default sp