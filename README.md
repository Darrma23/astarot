
<p align="center">
  <img src="https://files.catbox.moe/sduiyj.jpg" width="250"/>
</p>

<h1 align="center">Astarot-MultiDevice - WhatsApp Bot</h1>


---

## 👤 Owner

> GitHub: [Darrma23](https://github.com/darrma23.png)  
> Project: **Astarot-MultiDevice WhatsApp Bot**

---

> Bot WhatsApp modular yang kuat menggunakan JavaScript, dibuat dengan sistem plugin untuk fleksibilitas maksimal.

---

## 📌 Features

- Arsitektur berbasis plugin
- Ditulis dalam JavaScript
- Kompatibel dengan ESModule
- Pembuatan perintah yang mudah
- Terinspirasi oleh karakter anime kashiwada

---

## ⚙️ Install
```bash
$ git clone https://github.com/darrma23/astarot
$ cd astarot
$ npm install
$ npm start
```

## 🌐 Example Plugin File
## 🧠 Example Plugin (No Regex)

```javascript
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  // code
};

handler.command = ['expired', 'exp'];
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
handler.mods = false
handler.rowner = false;
handler.group = false;
handler.premium = false;
handler.admin = false;
handler.register = false;
handler.botAdmin = false;

export default handler;
```

---

## ⚡ Example Plugin (With Regex)

```javascript
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  // code
};

handler.command = /^(expired|exp)$/i;
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
handler.mods = false
handler.rowner = false;
handler.group = false;
handler.premium = false;
handler.admin = false;
handler.register = false;
handler.botAdmin = false;

export default handler;
```

---

## 💡 Command Fitur Plugin

```Plugin
.lp - buat liat list plugins
.sp file/file.js
.gp file/file.js
.dp file/file.js
```

---

## 💡 Menu Command

```
.menu       - Show main menu
.menu all   - Show all commands
.menu tags  - Show commands by tags
```

---

### Thx Atau Fungsi Di Script Atau Fitur
| [![ShirokamiRyzen](https://github.com/ShirokamiRyzen.png?size=100)](https://github.com/ShirokamiRyzen) | [![naruyaizumi](https://github.com/naruyaizumi.png?size=100)](https://github.com/naruyaizumi) | [![AndhikaGG](https://github.com/Darrma23.png?size=100)](https://github.com/Darrma23) |
|:--:|:--:|:--:|
| **[ShirokamiRyzen](https://github.com/ShirokamiRyzen)**<br/>Base Original | **[naruyaizumi](https://github.com/naruyaizumi)**<br/>Fungsi Base / Fungsi Di Script | **[Darma](https://github.com/darrma23)**<br/>Penambah Fitur |

> *"Hmmm...."*
