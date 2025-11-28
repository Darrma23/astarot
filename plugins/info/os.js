import os from "os";
import fs from "fs/promises";
import { execSync } from "child_process";

// Utils
function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    return (
        [d && `${d}d`, h % 24 && `${h % 24}h`, m % 60 && `${m % 60}m`]
            .filter(Boolean)
            .join(" ") || "0m"
    );
}

// OS Pretty Name (Node)
async function getOSPrettyName() {
    try {
        const text = await fs.readFile("/etc/os-release", "utf8");
        const info = Object.fromEntries(
            text
                .split("\n")
                .map(v => v.split("="))
                .filter(([k, v]) => k && v)
                .map(([k, v]) => [k.trim(), v.replace(/"/g, "")])
        );
        return {
            pretty: info["PRETTY_NAME"] || os.platform(),
            id: info["ID"] || "unknown",
            version: info["VERSION_ID"] || "unknown"
        };
    } catch {
        return {
            pretty: os.platform(),
            id: "unknown",
            version: "unknown"
        };
    }
}

// CPU Info
function getCPUInfo() {
    const cpus = os.cpus();
    const load = os.loadavg();
    const cores = cpus.length;
    const loadPercent = (l) => ((l / cores) * 100).toFixed(2);

    return {
        model: cpus[0]?.model || "Unknown",
        cores,
        speed: cpus[0]?.speed || 0,
        load1: load[0].toFixed(2),
        load5: load[1].toFixed(2),
        load15: load[2].toFixed(2),
        load1Pct: loadPercent(load[0]),
        load5Pct: loadPercent(load[1]),
        load15Pct: loadPercent(load[2]),
    };
}

// CPU Boot Usage
function getCPUUsageSinceBoot() {
    try {
        const out = execSync(
            "awk '/^cpu /{idle=$5; total=0; for(i=2;i<=NF;i++) total+=$i} END{print (total-idle)*100/total}' /proc/stat"
        ).toString().trim();

        const pct = parseFloat(out);
        return isNaN(pct) ? 0 : pct.toFixed(2);
    } catch {
        return 0;
    }
}

// RAM Info
async function getRAMInfo() {
    try {
        const text = await fs.readFile("/proc/meminfo", "utf8");
        const meminfo = text.split("\n").reduce((a, line) => {
            const [key, v] = line.split(":");
            if (key && v) a[key.trim()] = parseInt(v.trim());
            return a;
        }, {});

        const ramTotal = meminfo["MemTotal"] * 1024;
        const ramFree = meminfo["MemFree"] * 1024;
        const ramAvailable = meminfo["MemAvailable"] * 1024;
        const ramUsed = ramTotal - ramAvailable;

        const ramBuffers = meminfo["Buffers"] * 1024;
        const ramCached = meminfo["Cached"] * 1024;

        const swapTotal = meminfo["SwapTotal"] * 1024;
        const swapFree = meminfo["SwapFree"] * 1024;
        const swapUsed = swapTotal - swapFree;

        const totalUsed = ramUsed + swapUsed;
        const totalMemory = ramTotal + swapTotal;

        return {
            ramUsed, ramTotal, ramFree, ramAvailable,
            ramBuffers, ramCached, swapUsed, swapTotal,
            totalUsed, totalMemory,
        };
    } catch {
        return {
            ramUsed: 0, ramTotal: 0, ramFree: 0, ramAvailable: 0,
            ramBuffers: 0, ramCached: 0, swapUsed: 0, swapTotal: 0,
            totalUsed: 0, totalMemory: 0
        };
    }
}

// Disk Usage
function getDiskUsage() {
    try {
        const out = execSync("df -k --output=size,used,avail,pcent,target /")
            .toString().trim().split("\n")[1];
        const p = out.split(/\s+/);
        return {
            used: parseInt(p[1]) * 1024,
            total: parseInt(p[0]) * 1024,
            available: parseInt(p[2]) * 1024,
        };
    } catch {
        return { used: 0, total: 0, available: 0 };
    }
}

// Inode Usage
async function getInodeUsage() {
    try {
        const lines = execSync("df -i /").toString().trim().split("\n");
        const p = lines[1].split(/\s+/);
        return {
            total: parseInt(p[1]) || 0,
            used: parseInt(p[2]) || 0,
            available: parseInt(p[3]) || 0,
        };
    } catch {
        return { total: 0, used: 0, available: 0 };
    }
}

// Heap Info
function getHeapInfo() {
    const mem = process.memoryUsage();
    return {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        rss: mem.rss,
        external: mem.external,
        arrayBuffers: mem.arrayBuffers || 0,
    };
}

// Process Info
function getProcessInfo() {
    return {
        pid: process.pid,
        ppid: process.ppid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
    };
}

// Network Stats
async function getNetworkStats() {
    try {
        const text = await fs.readFile("/proc/net/dev", "utf8");
        let rx = 0, tx = 0;
        const lines = text.split("\n").slice(2);

        for (const line of lines) {
            if (!line.trim()) continue;
            const p = line.trim().split(/\s+/);
            if (p[0].includes("lo:")) continue;
            rx += parseInt(p[1]) || 0;
            tx += parseInt(p[9]) || 0;
        }
        return { rx, tx };
    } catch {
        return { rx: 0, tx: 0 };
    }
}

// Warnings
function getWarnings(cpu, ram, disk, inodes, heap) {
    const warn = [];

    const cpuPct = parseFloat(cpu.load1Pct);
    if (cpuPct > 90) warn.push("⚠︎ CRITICAL: Very high CPU load (>90%)");
    else if (cpuPct > 70) warn.push("⚠︎ WARNING: High CPU load (>70%)");

    const ramPct = (ram.totalUsed / ram.totalMemory) * 100;
    if (ramPct > 90) warn.push("⚠︎ CRITICAL: Memory almost full");
    else if (ramPct > 80) warn.push("⚠︎ WARNING: Memory tinggi (>80%)");

    if (ram.swapTotal > 0) {
        const sp = (ram.swapUsed / ram.swapTotal) * 100;
        if (sp > 50) warn.push("⚠︎ WARNING: High swap usage (>50%)");
    }

    const diskPct = (disk.used / disk.total) * 100;
    if (diskPct > 90) warn.push("⚠︎ CRITICAL: Disk almost full");
    else if (diskPct > 80) warn.push("⚠︎ WARNING: Disk usage >80%");

    if (inodes.total > 0) {
        const inodePct = (inodes.used / inodes.total) * 100;
        if (inodePct > 90) warn.push("⚠︎ CRITICAL: Inodes very low");
        else if (inodePct > 80) warn.push("⚠︎ WARNING: Inodes high");
    }

    if (heap.rss > 500 * 1024 * 1024)
        warn.push("⚠︎ WARNING: Bot memory >500MB");

    return warn;
}

// Bar visual
function makeBar(used, total, length = 10) {
    const ratio = total ? Math.min(1, used / total) : 0;
    const fill = Math.round(ratio * length);
    const empty = length - fill;
    const pct = (ratio * 100).toFixed(1);
    let ic = "✓";
    if (ratio > 0.9) ic = "✗";
    else if (ratio > 0.8) ic = "⚠";

    return `[${"█".repeat(fill)}${"░".repeat(empty)}] ${pct}% ${ic}`;
}

// Handler
let handler = async (m, { conn }) => {
    const osInfo = await getOSPrettyName();
    const cpu = getCPUInfo();
    const cpuBoot = getCPUUsageSinceBoot();
    const ram = await getRAMInfo();
    const disk = getDiskUsage();
    const inode = await getInodeUsage();
    const heap = getHeapInfo();
    const proc = getProcessInfo();
    const net = await getNetworkStats();

    const ramBar = makeBar(ram.totalUsed, ram.totalMemory);
    const ramOnlyBar = makeBar(ram.ramUsed, ram.ramTotal);
    const swapBar = ram.swapTotal > 0 ? makeBar(ram.swapUsed, ram.swapTotal) : "N/A";
    const diskBar = makeBar(disk.used, disk.total);
    const inodeBar = inode.total ? makeBar(inode.used, inode.total) : "N/A";
    const heapBar = makeBar(heap.rss, ram.ramTotal);

    const uptimeBot = formatTime(process.uptime());
    const uptimeSys = formatTime(os.uptime());

    const warnings = getWarnings(cpu, ram, disk, inode, heap);
    const warningSection = warnings.length
        ? `\n────────────────────────────\nSYSTEM WARNINGS\n${warnings.join("\n")}\n`
        : "";

    const message = `
\`\`\`
━━━ SYSTEM INFORMATION ━━━
OS: ${osInfo.pretty}
Distribution: ${osInfo.id} ${osInfo.version}
Kernel: ${os.release()}
Platform: ${os.platform()} (${os.arch()})
Hostname: ${os.hostname()}
System Uptime: ${uptimeSys}

━━━ SOFTWARE VERSIONS ━━━
Node.js: ${proc.nodeVersion}
Process ID: ${proc.pid}
Parent PID: ${proc.ppid}
Bot Uptime: ${uptimeBot}

━━━ CPU INFORMATION ━━━
Model: ${cpu.model}
Cores: ${cpu.cores} @ ${cpu.speed} MHz
Architecture: ${os.arch()}
Load Average:
1 min: ${cpu.load1} (${cpu.load1Pct}%)
5 min: ${cpu.load5} (${cpu.load5Pct}%)
15 min: ${cpu.load15} (${cpu.load15Pct}%)
Usage Since Boot: ${cpuBoot}%

━━━ MEMORY INFORMATION ━━━
Physical RAM:
Used: ${formatSize(ram.ramUsed)} / ${formatSize(ram.ramTotal)}
${ramOnlyBar}
Available: ${formatSize(ram.ramAvailable)}
Buffers: ${formatSize(ram.ramBuffers)}
Cached: ${formatSize(ram.ramCached)}
Swap Memory:
Used: ${formatSize(ram.swapUsed)} / ${formatSize(ram.swapTotal)}
${swapBar}
Total (RAM + Swap):
${formatSize(ram.totalUsed)} / ${formatSize(ram.totalMemory)}
${ramBar}

━━━ PROCESS MEMORY (Bot) ━━━
RSS: ${formatSize(heap.rss)}
Heap Used: ${formatSize(heap.heapUsed)}
Heap Total: ${formatSize(heap.heapTotal)}
${heapBar}
External: ${formatSize(heap.external)}
Array Buffers: ${formatSize(heap.arrayBuffers)}
Memory Efficiency: ${((heap.heapUsed / heap.rss) * 100).toFixed(1)}%

━━━ DISK INFORMATION ━━━
Used: ${formatSize(disk.used)} / ${formatSize(disk.total)}
${diskBar}
Available: ${formatSize(disk.available)}

Inodes:
Used: ${inode.used.toLocaleString()} / ${inode.total.toLocaleString()}
${inodeBar}

━━━ NETWORK STATISTICS ━━━
RX: ${formatSize(net.rx)}
TX: ${formatSize(net.tx)}
Total Traffic: ${formatSize(net.rx + net.tx)}

${warningSection}────────────────────────────
Status: ${warnings.length ? "⚠ Attention Required" : "✓ System Healthy"}
Report Time: ${new Date().toLocaleString("id-ID")}
\`\`\`
`.trim();

    await conn.sendMessage(
        m.chat,
        {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: "System Monitoring Report",
                    body: "Detailed server and bot metrics",
                    thumbnailUrl: "https://qu.ax/syOjg.jpg",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        },
        { quoted: m }
    );
};

handler.help = ["os"];
handler.tags = ["info"];
handler.command = /^(os)$/i;

export default handler;