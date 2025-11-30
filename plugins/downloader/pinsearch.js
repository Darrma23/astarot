import https from "https";
import axios from "axios";

// =========================
// FUNCTION: GET AUTH
// =========================
const getInitialAuth = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "id.pinterest.com",
      path: "/",
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    };

    https
      .get(options, (res) => {
        const cookies = res.headers["set-cookie"];
        if (cookies) {
          const csrf = cookies.find(c => c.startsWith("csrftoken="));
          const sess = cookies.find(c => c.startsWith("_pinterest_sess="));

          if (csrf && sess) {
            const token = csrf.split(";")[0].split("=")[1];
            const session = sess.split(";")[0];
            resolve({
              csrftoken: token,
              cookieHeader: `csrftoken=${token}; ${session}`
            });
            return;
          }
        }
        reject(new Error("Gagal mendapatkan CSRF token atau session cookie."));
      })
      .on("error", e => reject(e));
  });
};

// =========================
// FUNCTION: SEARCH PINTEREST
// =========================
const searchPinterestAPI = async (query, limit) => {
  try {
    const { csrftoken, cookieHeader } = await getInitialAuth();
    let results = [];
    let bookmark = null;
    let keepFetching = true;

    while (keepFetching && results.length < limit) {
      const postData = {
        options: { query, scope: "pins", bookmarks: bookmark ? [bookmark] : [] },
        context: {},
      };

      const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}`;
      const dataString =
        `source_url=${encodeURIComponent(sourceUrl)}` +
        `&data=${encodeURIComponent(JSON.stringify(postData))}`;

      const options = {
        hostname: "id.pinterest.com",
        path: "/resource/BaseSearchResource/get/",
        method: "POST",
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrftoken,
          "X-Pinterest-Source-Url": sourceUrl,
          Cookie: cookieHeader,
        },
      };

      const responseBody = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = "";
          res.on("data", chunk => (body += chunk));
          res.on("end", () => resolve(body));
        });
        req.on("error", reject);
        req.write(dataString);
        req.end();
      });

      const json = JSON.parse(responseBody);
      const pins = json?.resource_response?.data?.results || [];

      pins.forEach(pin => {
        const img736 = pin.images?.["736x"]?.url;
        const imgOrig = pin.images?.["orig"]?.url;
        if (img736) results.push(img736);
        else if (imgOrig) results.push(imgOrig);
      });

      bookmark = json?.resource_response?.bookmark;
      if (!bookmark || pins.length === 0) keepFetching = false;
    }

    return results.slice(0, limit);
  } catch (err) {
    throw new Error(`Terjadi kesalahan: ${err.message}`);
  }
};

// =========================
// HANDLER PLUGIN
// =========================
let handler = async (m, { conn, text }) => {
  try {
    await global.wait(m, conn);

    if (!text) {
      return m.reply("Format:\n.pinsearch <query> <jumlah>\nContoh: .pinsearch girl 5");
    }

    // PARSING: default limit = 1
    const parts = text.trim().split(" ");
    let limit = 1;

    if (!isNaN(parts[parts.length - 1])) {
      limit = Number(parts.pop());
    }

    const query = parts.join(" ").trim();
    if (!query) return m.reply("Query kosong.");

    await conn.sendMessage(m.chat, { text: `Mencari "${query}" (${limit} gambar)...` }, { quoted: m });

    const results = await searchPinterestAPI(query, limit);
    if (!results.length) return m.reply("Tidak ditemukan gambar.");

    for (const url of results) {
      try {
        const file = await axios.get(url, { responseType: "arraybuffer" });
        await conn.sendMessage(
          m.chat,
          { image: Buffer.from(file.data), caption: query },
          { quoted: m }
        );
      } catch {
        await conn.sendMessage(m.chat, { text: `Gagal ambil: ${url}` }, { quoted: m });
      }
    }

    await global.wait(m, conn);

  } catch (e) {
    m.reply("Error: " + e.message);
  }
};

handler.help = ["pinsearch <query> <jumlah>"];
handler.tags = ["downloader"];
handler.command = /^pinsearch$/i;

export default handler;