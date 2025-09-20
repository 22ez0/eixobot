// info2.ts

import { Client, GatewayIntentBits, Interaction, CommandInteraction } from "discord.js";
import { 
  registrarComandoRoleAll, 
  registrarComandoDeleteRoles, 
  registrarComandoUrl, 
} from "./RolleAll";
import { handleVoiceAndStatus } from "./VoiceHandler";
import { setupAutomod } from "./automodEvents";
import { setupUrlEvents } from "./urlEvents";
import { setupDynamicStatus } from "./status"; 
import { setupVerification } from "./verification"; 

// --- Importe os novos comandos ---
import { data as copyData, execute as copyExecute } from './copy-command';
import { data as pasteData, execute as pasteExecute } from './paste-command';
// --- Fim da Importação ---

// --- Lógica de Registro de Comandos ---
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

// Defina as variáveis de ambiente necessárias
const CLIENT_ID = process.env.CLIENT_ID; 
const GUILD_ID = '1418330610942087282'; 
const BOT_TOKEN = process.env.BOT_TOKEN; 

// Adicione os novos comandos à lista
const commands = [
  new SlashCommandBuilder()
    .setName('verificar')
    .setDescription('Cria um canal de verificação e configura as permissões.'),
  copyData, // Adiciona o comando /copy
  pasteData, // Adiciona o comando /paste
];

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('Iniciando o registro de comandos de slash...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('Comandos de slash registrados com sucesso!');
  } catch (error) {
    console.error('Ocorreu um erro ao registrar os comandos:', error);
  }
})();
// --- Fim da Lógica de Registro ---


export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", () => {
  console.log(`🤖 Bot conectado como ${client.user?.tag}`);

  // Seus outros setups
  setupAutomod(client);
  setupUrlEvents(client);
  handleVoiceAndStatus(client);
  registrarComandoRoleAll(client);
  registrarComandoDeleteRoles(client);
  registrarComandoUrl(client);
  setupDynamicStatus(client);

  // Chama a função de verificação
  setupVerification(client);
});

// Adicione o listener para os novos comandos
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'copy') {
    await copyExecute(interaction);
  } else if (interaction.commandName === 'paste') {
    await pasteExecute(interaction);
  }
});

client.login(process.env.BOT_TOKEN);
