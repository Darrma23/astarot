const izumi = async (m) => {
    const start = performance.now();
    
    // hitung delay internal 
    await Promise.resolve();

    const ping = Math.round(performance.now() - start);

    m.reply(
        Func.Styles(`☘️ Pong!\nResponse time: ${ping}ms`)
    );
};

izumi.command = ['ping'];
izumi.help = ['ping'];
izumi.tags = ['run'];

export default izumi;