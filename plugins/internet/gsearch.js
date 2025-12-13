import g from '../../lib/google-search-ai.js'

let handler = async (m, { conn, text, prefix, command }) => {
    await global.wait(m, conn)

    const q = m.q
    let query
    let reply = q || m

    if (q) {
        const name = q.pushName ? q.pushName + ' : ' : ''
        const yourPrompt = text ? `aku: ${text}` : 'aku: tolong jelasin'
        query = `${name}${q.text}\n\n${yourPrompt}`
    } else {
        query = text
    }

    if (!query) return await m.reply('mana query nya?')

    const result = await g.search(query).catch(e => `Error: ${e.message}`)

    await m.reply(result)
    await global.wait(m, conn, true)
}

handler.help = ["search"]
handler.tags = ["internet"]
handler.command = /^(search)$/i

export default handler