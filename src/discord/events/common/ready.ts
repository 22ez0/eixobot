import { createEvent } from "#base";
import { handleVoiceAndStatus } from "../../commands/public/VoiceHandler.js";
import { setupVerification } from "../../commands/public/verification.js";
import { Client } from "discord.js";

createEvent({
    name: "Voice and Status Handler",
    event: "clientReady",
    once: true,
    async run(client: Client<true>) {
        console.log("🎵 Inicializando funcionalidade de voice...");
        // Iniciar funcionalidade de voice e status
        handleVoiceAndStatus(client);
        
        console.log("🔘 Configurando botão de verificação...");
        // Configurar apenas o botão de verificação (comando já está no verificar.ts)
        setupVerification(client);
    },
});