import axios from "axios";

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("mana promtnya?");

  await global.wait(m, conn);
  let res = await webpilot(text);

  if (res.error) return m.reply("error: " + res.error);

  let pesan = `${res.text || "-"}`;

  if (res.source?.length) {
    pesan += `\n📎 *Sumber Internet*\n${res.source
      .map((v) => "• " + (v.url || JSON.stringify(v)))
      .join("\n")}`;
  }

  return m.reply(pesan);
  await global.wait(m, conn, true);
};

handler.help = ["web <query>"];
handler.tags = ["internet"];
handler.command = /^(webpilot|web)$/i;

export default handler;

async function webpilot(q) {
  try {
    const r = await axios.post(
      "https://api.webpilotai.com/rupee/v1/search",
      { q, threadId: "" },
      {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
          Accept: "application/json,text/plain,*/*,text/event-stream",
          "Content-Type": "application/json",
          authorization: "Bearer null",
          origin: "https://www.webpilot.ai"
        }
      }
    );

    let text = "";
    let src = [];

    return await new Promise((done) => {
      r.data.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("data:")) {
            try {
              const j = JSON.parse(lines[i].slice(5).trim());

              if (
                j.type === "data" &&
                j.data &&
                j.data.content &&
                !j.data.section_id
              ) {
                text += j.data.content;
              }

              if (j.action === "using_internet" && j.data) {
                src.push(j.data);
              }
            } catch {}
          }
        }
      });

      r.data.on("end", () => {
        done({ text: text.trim(), source: src });
      });
    });
  } catch (e) {
    return { error: e.message };
  }
}