/*
  nama   : google search ai mode
  base   : https://www.google.com
  by     : wolep
  update : 21 november 2025m 2 AM
  node   : v24.11.1
  note   : as always fungsi parsing html gw minta ke ai :v
           next update mungkin gw bakalan isi support conversation
           gw belum tau value apa aja yang minimal disertain
           tapi skrep ini udh work as expected, minus one time
           conversation ajah :v. tapi lumayan lah bua gratisan
           haha
  module : esm (tested) / cjs (gak tau coba test yah :v)
*/

import * as cheerio from 'cheerio'

const g = {

    helper: {
        log: function (message) {
            //oreturn
            console.log(`[google search ai] ${message}`)
        },

        formatError: function (string) {
            const MAX_LENGTH = 200
            const type = typeof (string)
            if (type !== "string") return `(gak bisa nampilin teks karena type yg di kasih adalah ${type})`
            if (!string) return '(empty message)'
            let message = string
            try {
                message = JSON.stringify(JSON.parse(string), null, 2)
            } catch (_) { }
            if (message.length > MAX_LENGTH) {
                message = message.substring(0, MAX_LENGTH) + `... (trimmed ${string.length - MAX_LENGTH} characters)`
            }
            return message
        }
    },

    getCookie: async function () {
        this.helper.log('coba ambil kuki')
        const r = await fetch("https://play.google.com/log?format=json&hasfast=true&authuser=0", {
            "headers": {
                'accept-encoding': 'gzip, deflate, br, zsdch, zstd'
            },
            "body": "[[1,null,null,null,null,null,null,null,null,null,[null,null,null,null,\"en-ID\",null,null,null,[[[\"Chromium\",\"142\"],[\"Not_A Brand\",\"99\"],[\"Google Chrome\",\"142\"]],0,\"Windows\",\"15.0.0\",\"x86\",\"\",\"142.0.7444.163\"],[4,0]]],596,[[\"1763639555843\",null,null,null,null,null,null,\"[null,[\\\"2ahUKEwjtoP2h1YCRAxV1yzgGHeqmFYsQiJoOegYIAAgAEBM\\\"],null,null,null,null,null,null,null,[50]]\",null,null,null,null,null,null,-28800,null,null,null,null,null,1,null,null,\"[[[1763639555842000,0,0],4],null,null,[null,null,3,null,null,null,null,null,null,null,\\\"2ahUKEwjtoP2h1YCRAxV1yzgGHeqmFYsQiJoOegYIAAgAEBM\\\"]]\"]],\"1763639555843\",null,null,null,null,null,null,null,null,null,null,null,null,null,[[null,[null,null,null,null,null,null,null,null,null,null,null,null,89978449]],9]]",
            "method": "POST"
        });
        if (!r.ok) throw Error(`${r.status} ${r.statusText} di fungsi getCookie\n${this.helper.formatError(await r.text())}`)
        const cookie = r.headers.getSetCookie()[0].split("; ")[0]
        return { cookie }
    },

    apiSearch: async function (query, cookie) {
        this.helper.log('hit api search')
        const pertanyaan = query
        const r = await fetch("https://www.google.com/async/folif?ei=8wAfaa3bDfWW4-EP6s3W2Ag&yv=3&aep=22&sca_esv=100be553d7950a9c&source=hp&udm=50&stkp=0&cs=1&csuir=0&elrc=CmowYTcxa0tLT3NsZGQyUzhwaGEwQzU1dG10bzRtU09nYzNlZmFPM2dmbDZQWjl1ZnV5S2Q4c1NVUVZXamUwdzRGVzRXdmE3aHBvYlNDWjFpTTVHamhsMTNuXy05MlB5TkFFUm5IRjlTdURREhc4d0FmYWEzYkRmV1c0LUVQNnMzVzJBZxoLUVl3ZG90SUpKTE0&mstk=AUtExfBYZSu-e78DR2kr63-4EO-x1ELfy76o7hjhOVOVzwTATs7ru9uQwfg3SE2TItnNfDWulluSvCH6lvcPL2qBrwsjF2lnO-Drb0_tGndJYTALKwofwExTre-6MDCI_geuLCpH_gcNMJJ7go39xzqNKZqPHmVr1dGHlQg&csui=3&q=" + encodeURIComponent(pertanyaan) + "&ved=1t%3A244952&async=_fmt:adl,_snbasecss:https%3A%2F%2Fwww.gstatic.com%2F_%2Fmss%2Fsearch-next%2F_%2Fss%2Fk%3Dsearch-next.aim.OB36VA5Djzs.L.B1.O%2Fam%3DAAAAAAAAAAAAAAAACAgZAAAAAAQAAAAAIAAAACAAAACAEADAhQgCCEAEEgAAABAAAAAAAAAAgAAAoAAAAABAAAAAAAAAAAAAAABgFgQgCABIAYE3AAMAgEABgAI%2Fd%3D1%2Fexcm%3DASY0Wd%2CAiz46d%2CAo6dnf%2CAzSnD%2CD1nDFc%2CE1OJWe%2CEj7pAc%2CEsqXXd%2CFF5Y8b%2CFWrJQc%2CFckSrf%2CFyH0nb%2CGnLh6e%2CHoxWed%2CIyd0xc%2CKGeR3c%2CRviR3d%2CStgeed%2CTdu1Vc%2CUhtX3d%2CVnu7zd%2CW8NV9d%2CWOOgyb%2CWr4gwf%2CX3KV0%2CXmAqMd%2CZ7MAyf%2Ca419X%2CayDvec%2Cb%2Cb4fE6b%2Cb7b88%2CbT5qhd%2CbTGTre%2CbYAJce%2CblIcIb%2CcuZPYc%2Ce70zne%2CeBhDS%2CfZp0ed%2Cg0BaKe%2CgKbrsf%2Ch5g25d%2CjLZYRc%2CjrKk6c%2CkGVn2c%2CrRecze%2CrXUgd%2CrZPHBe%2CsecKrf%2Ct8ZFHb%2CtXNq8b%2CtxW4Ec%2CuAuYHe%2Cvu0Pcd%2Cw0tqF%2CxBG21%2Cy4TDlb%2CyxVckb%2CzLVn4b%2Fed%3D1%2Fdg%3D2%2Fujg%3D1%2Frs%3DAE5fCmQG1Fy5I8n_8YcfBeoPxr_aKOtqXQ", {
            "headers": {
                "cookie": cookie,
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            "body": null,
            "method": "GET"
        })
        if (!r.ok) throw Error(`${r.status} ${r.statusText} di fungsi search\n${this.helper.formatError(await r.text())}`)
        const html = await r.text()
        return { html }
    },

    parseHtml: (html) => {
        const $ = cheerio.load(html);

        // remove invisible DOM (browser juga tidak menampilkan ini)
        $('script, style, noscript').remove();
        $('[style*="display:none"]').remove();
        $('[hidden]').remove();
        $('[aria-hidden="true"]').remove();
        $('[data-ved]').remove();
        $('svg, path').remove();

        // remove google injected comment nodes
        $.root().contents().each(function () {
            if (this.type === 'comment') {
                $(this).remove();
            }
        });

        const text = $("div[data-target-container-id='5']")
            .map((i, el) => $(el).text().replace(/\s+/g, ' ').trim())
            .get()
            .filter(Boolean);

            console.log(text)
        text.pop();
        return { result: text.join("\n") };
    }
    ,

    search: async function (query) {
        if (!query) throw Error(`param query gak boleh kosong`)
        const { cookie } = await this.getCookie()
        const { html } = await this.apiSearch(query, cookie)
        const { result } = this.parseHtml(html)
        this.helper.log('done')
        return result
    }
}

// cara pakai
// g.search('apa yang dimaksud dengan cosmic indifference ?')
//     .then(console.log)
//     .catch(console.log)

/* output
Cosmic indifference (ketidakpedulian kosmik) adalah sebuah konsep filosofis yang menyatakan bahwa alam semesta (kosmos) tidak memiliki perasaan, kesadaran, atau tujuan yang terkait dengan keberadaan manusia. Alam semesta tidak memihak —ia tidak peduli atau menentang manusia atau kepentingan manusia.
Poin-poin utama dari konsep ini meliputi:
Netralitas Alam Semesta: Alam semesta beroperasi berdasarkan hukum-hukum fisika dan proses alami, yang acuh tak acuh terhadap harapan, moralitas, penderitaan, atau aspirasi manusia.Ketidakberartian Manusia: Dalam skema keberadaan intergalaksi yang sangat besar dan tidak dapat dipahami, manusia dan masalah-masalahnya sangat tidak penting (insignifikan).Sumber Makna: Konsep ini sering menyiratkan bahwa makna hidup tidak datang dari alam semesta itu sendiri, tetapi harus diciptakan oleh manusia melalui perspektif dan tindakan mereka sendiri.Hubungan dengan Kosmisisme: Konsep ini adalah tema sentral dalam filsafat kosmisisme, yang dikembangkan oleh penulis horor H.P. Lovecraft. Kosmisisme menekankan ketakutan manusia akan ketidakberartian mereka di hadapan alam semesta yang luas dan asing.
Singkatnya, "cosmic indifference" adalah pandangan bahwa alam semesta tidak peduli dengan apa yang terjadi pada kita, mengingatkan kita bahwa kita sendirilah yang bertanggung jawab untuk menemukan atau menciptakan makna dalam hidup kita.
*/

export default g