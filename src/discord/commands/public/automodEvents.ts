import { Message, Collection, GuildMember, Client } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const warningsPath = path.resolve(__dirname, 'warnings.json');

function loadWarnings(): { [key: string]: number } {
    if (!fs.existsSync(warningsPath)) {
        fs.writeFileSync(warningsPath, JSON.stringify({}));
        return {};
    }
    const data = fs.readFileSync(warningsPath, 'utf-8');
    return JSON.parse(data);
}

function saveWarnings(warnings: { [key: string]: number }) {
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
}

const warningsCache = loadWarnings();

const spamWatcher = new Collection<string, { count: number, lastMessage: number }>();
const identicalMessageWatcher = new Collection<string, { count: number, lastMessage: number, content: string }>();

export function setupAutomod(client: Client): void {
    client.on("messageCreate", async (message: Message) => {
        if (message.author.bot) return;

        const member = message.guild?.members.cache.get(message.author.id);
        if (!member) return;

        if (message.channel.type === 0) {
            await checkRules(message, member);
        }
    });
}

async function checkRules(message: Message, member: GuildMember): Promise<void> {
    await checkForbiddenWords(message, member);
    await checkLinks(message);
    await checkCapsLock(message);
    await checkSpam(message, member);
}

async function checkForbiddenWords(message: Message, member: GuildMember): Promise<void> {
    const forbiddenWords = [
        /(c|s)p/i, /c[h1]ild ?p[0o]rn/i, /estupr[o0]/i, /g[o0]r[e3]/i, 
        /sexo ?(com )?crian[çc][a4]/i, /p[e3]d[o0]filia/i, /z[o0][o0]fili[a4]/i,     
        /p[e3]d[o0]fili[a4]/i, /(porn|porno|p[o0]rn)[o0] ?(de)? ?crian[çc]a/i,
        /(s|z)e(x|k)o ?i(n|m)c(e|e)st[o0]/i, /abuso ?(s|z)e(x|k)u(a|a)l/i,
    ];

    const content = message.content.toLowerCase();
    const found = forbiddenWords.some(regex => regex.test(content));

    if (found) {
        await message.delete();

        const userId = message.author.id;
        warningsCache[userId] = (warningsCache[userId] || 0) + 1;
        saveWarnings(warningsCache);

        if (warningsCache[userId] > 1) {
            await member.kick("Persistência no uso de palavras proibidas.");
            delete warningsCache[userId];
            saveWarnings(warningsCache);
        } else {
            if (message.channel && 'send' in message.channel) {
                await message.channel.send({
                content: `${message.author}, sua mensagem foi apagada por conter palavras proibidas. Um novo aviso foi registrado. A reincidência resultará em expulsão.`,
                    flags: 64 as any
                });
            }
        }
    }
}

async function checkLinks(message: Message) {
    const allowedDomains = ["spotify.com", "instagram.com", "tenor.com", "giphy.com", "tiktok.com", "youtube.com"];
    const linkRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

    const linksFound = message.content.match(linkRegex);

    if (linksFound) {
        const hasDisallowedLink = linksFound.some(link => {
            return !allowedDomains.some(domain => link.includes(domain));
        });

        if (hasDisallowedLink) {
            await message.delete();
        }
    }
}

async function checkCapsLock(message: Message) {
    const content = message.content.replace(/[^a-zA-Z]/g, '');
    if (content.length < 10) return;

    const uppercaseCount = (content.match(/[A-Z]/g) || []).length;
    const capsLockPercentage = (uppercaseCount / content.length) * 100;

    if (capsLockPercentage > 75) {
        await message.delete();
    }
}

async function checkSpam(message: Message, member: GuildMember): Promise<void> {
    const userId = message.author.id;
    const now = Date.now();

    if (!spamWatcher.has(userId)) {
        spamWatcher.set(userId, { count: 1, lastMessage: now });
    } else {
        const data = spamWatcher.get(userId)!;
        if (now - data.lastMessage < 15000) {
            data.count++;
            if (data.count >= 8) {
                await member.timeout(15 * 1000, "Spam de 8 mensagens em sequência.");
                data.count = 0;
            }
        } else {
            data.count = 1;
        }
        data.lastMessage = now;
    }

    if (!identicalMessageWatcher.has(userId)) {
        identicalMessageWatcher.set(userId, { count: 1, lastMessage: now, content: message.content });
    } else {
        const data = identicalMessageWatcher.get(userId)!;
        if (data.content === message.content && now - data.lastMessage < 5000) {
            data.count++;
            if (data.count >= 4) {
                await member.timeout(5 * 60 * 1000, "Spam de 4 mensagens idênticas.");
                data.count = 0;
            }
        } else {
            identicalMessageWatcher.set(userId, { count: 1, lastMessage: now, content: message.content });
        }
        data.lastMessage = now;
    }
}
