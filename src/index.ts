import { bootstrap } from "#base";
import { startServer } from "./server.js";

// Iniciar servidor HTTP para health check
startServer();

// Iniciar bot Discord
await bootstrap({ meta: import.meta });
