// status.ts

import { Client, ActivityType } from "discord.js";

export function setupDynamicStatus(client: Client): void {
    // Variável para controlar o status atual, declarada dentro da função
    let currentStatusIndex = 0;

    const statusList: Array<{ text: string; type: ActivityType }> = [
        { text: "insta: eixoserver", type: ActivityType.Custom },
        { text: "tiktok: eixoservidor", type: ActivityType.Custom },
        { text: "siga-nos nas redes sociais!", type: ActivityType.Playing },
        { text: "confira #server e entre no servidor!", type: ActivityType.Playing }
    ];

    client.on("ready", () => {
        // Loop que executa a cada 10 segundos
        setInterval(() => {
            try {
                // Altera o status de presença do bot
                client.user?.setPresence({
                    activities: [{
                        name: statusList[currentStatusIndex].text,
                        type: statusList[currentStatusIndex].type,
                    }],
                    status: 'online',
                });

                // Avança para o próximo status na lista
                currentStatusIndex = (currentStatusIndex + 1) % statusList.length;

            } catch (error) {
                console.error("Erro no loop de status:", error);
            }
        }, 10000);
    });
}
