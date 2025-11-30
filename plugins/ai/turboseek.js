import axios from "axios";

let handler = async (m, { conn, text }) => {
    try {
        if (!text) return m.reply('Mau nanya apa sih? Contoh: .tseek apa itu AI');

        await global.wait(m, conn);

        const result = await turboseek(text);

        const msg = `🧠 *TurboSeek Result*
        
❓ *Pertanyaan:* ${text}

📌 *Jawaban:*
${result.answer}

🔗 *Sources:*
${result.sources.length ? result.sources.map((v, i) => `${i + 1}. ${v}`).join('\n') : '-'}

✨ *Similar Questions:*
${result.similarQuestions?.length ? result.similarQuestions.join('\n') : '-'}`;

        await conn.sendMessage(m.chat, { text: msg }, { quoted: m });

    } catch (e) {
        m.reply('Error: ' + e.message);
    }
};

handler.command = ['tseek', 'turboseek'];
handler.help = ['tseek'];
handler.tags = ['ai'];

export default handler;


async function turboseek(question) {
    try {
        if (!question) throw new Error('Question is required.');
        
        const inst = axios.create({
            baseURL: 'https://www.turboseek.io/api',
            headers: {
                origin: 'https://www.turboseek.io',
                referer: 'https://www.turboseek.io/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });

        const { data: sources } = await inst.post('/getSources', { question });

        const { data: similarQuestions } = await inst.post('/getSimilarQuestions', {
            question,
            sources
        });

        const { data: answer } = await inst.post('/getAnswer', {
            question,
            sources
        });

        const cleanAnswer =
            answer.match(/<p>(.*?)<\/p>/gs)?.map(match =>
                match
                    .replace(/<\/?p>/g, '')
                    .replace(/<\/?strong>/g, '')
                    .replace(/<\/?em>/g, '')
                    .replace(/<\/?b>/g, '')
                    .replace(/<\/?i>/g, '')
                    .replace(/<\/?u>/g, '')
                    .replace(/<\/?[^>]+(>|$)/g, '')
                    .trim()
            ).join('\n\n') ||
            answer.replace(/<\/?[^>]+(>|$)/g, '').trim();

        return {
            answer: cleanAnswer,
            sources: sources.map(s => s.url),
            similarQuestions
        };

    } catch (error) {
        throw new Error(error.message);
    }
}