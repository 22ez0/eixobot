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

// Command imports handled by base framework

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

// Command interactions handled by base framework

client.login(process.env.BOT_TOKEN);
