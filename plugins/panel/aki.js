import { Aki } from 'aki-api';

global.akiSession = global.akiSession || {};

function buildAkiButtons(answers) {
  return answers.map((ans, i) => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: ans,
      id: `aki_${i}`
    })
  }));
}

let handler = async (m, { conn, command }) => {

  /* ===============================
     START AKINATOR
  =============================== */
  if (command === 'akinator') {
    const aki = new Aki({
      region: 'id',
      childMode: true
    });

    await aki.start();
    global.akiSession[m.sender] = aki;

    return conn.relayMessage(m.chat, {
      interactiveMessage: {
        header: {
          title: '🎩 AKINATOR',
          subtitle: 'Aku bisa nebak karaktermu'
        },
        body: {
          text: aki.question
        },
        footer: {
          text: 'Pilih jawaban di bawah'
        },
        nativeFlowMessage: {
          buttons: buildAkiButtons(aki.answers)
        }
      }
    }, {});
  }

  /* ===============================
     HANDLE INTERACTIVE RESPONSE
  =============================== */
  const response =
    m.message?.interactiveResponseMessage?.nativeFlowResponseMessage;

  if (!response) return;

  const parsed = response.paramsJson
    ? JSON.parse(response.paramsJson)
    : null;

  const id = parsed?.id;
  if (!id) return;

  const aki = global.akiSession[m.sender];
  if (!aki) return m.reply('❌ Session Akinator habis. Ketik .akinator lagi.');

  /* ===============================
     HANDLE GUESS CONFIRM
  =============================== */
  if (id === 'aki_yes') {
    delete global.akiSession[m.sender];
    return m.reply('🎉 Kena. Akinator menang. Manusia kalah lagi.');
  }

  if (id === 'aki_no') {
    await aki.continue();
  }

  /* ===============================
     HANDLE ANSWER STEP
  =============================== */
  if (id.startsWith('aki_')) {
    const answerIndex = parseInt(id.split('_')[1]);
    if (isNaN(answerIndex)) return;

    await aki.step(answerIndex);
  }

  /* ===============================
     AKINATOR TRY TO GUESS
  =============================== */
  if (aki.progress >= 70) {
    const guess = await aki.answer();
    const g = guess.answers?.[0];

    if (!g) return;

    return conn.relayMessage(m.chat, {
      interactiveMessage: {
        header: {
          title: '🤔 Aku menebak…',
          subtitle: `${aki.progress}% yakin`
        },
        body: {
          text:
`Nama: *${g.name}*
${g.description}`
        },
        footer: {
          text: 'Bener atau salah?'
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '✔️ Betul',
                id: 'aki_yes'
              })
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '❌ Salah',
                id: 'aki_no'
              })
            }
          ]
        }
      }
    }, {});
  }

  /* ===============================
     NEXT QUESTION
  =============================== */
  await conn.relayMessage(m.chat, {
    interactiveMessage: {
      header: {
        title: '🎩 AKINATOR',
        subtitle: 'Pertanyaan selanjutnya'
      },
      body: {
        text: aki.question
      },
      footer: {
        text: 'Jawab jujur ya. Jangan ngeyel.'
      },
      nativeFlowMessage: {
        buttons: buildAkiButtons(aki.answers)
      }
    }
  }, {});
};

handler.command = ['akinator'];
handler.tags = ['game'];
handler.help = ['akinator'];

export default handler;