// info2.ts

import { Client, GatewayIntentBits } from "discord.js";
import { 
  registrarComandoRoleAll, 
  registrarComandoDeleteRoles, 
  registrarComandoUrl, 
} from "./RolleAll.js";
import { handleVoiceAndStatus } from "./VoiceHandler.js";
import { setupAutomod } from "./automodEvents.js";
import { setupUrlEvents } from "./urlEvents.js";
import { setupDynamicStatus } from "./status.js"; 
import { setupVerification } from "./verification.js"; 

// --- Importe os novos comandos ---
import { data as copyData, execute as copyExecute } from './copy-command.js';
import { data as pasteData, execute as pasteExecute } from './paste-command.js';
// --- Fim da Importação ---

// Command registration is handled by the base framework
// Removed duplicate registration to prevent API rate limiting


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
