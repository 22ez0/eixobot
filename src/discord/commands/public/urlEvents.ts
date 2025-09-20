import { Client, Interaction, Presence, ActivityType } from "discord.js";

// ID dos cargos que serão adicionados e removidos
const ROLE_ID_1 = "1418390573508858016";
const ROLE_ID_2 = "1418390682023886980";
const URL_TO_CHECK = "/eixo";

// Função para verificar se o usuário tem a URL no status
const hasUrlInStatus = (presence: Presence | null) => {
    if (!presence) return false;
    return presence.activities.some(activity => 
        activity.type === ActivityType.Custom && activity.state?.includes(URL_TO_CHECK)
    );
};

// Configura os eventos de interação e presença
export function setupUrlEvents(client: Client) {
    // Evento para lidar com o clique no botão
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.isButton() || interaction.customId !== "verify_url_button") return;

        await interaction.deferReply({ flags: 64 });

        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member) {
            await interaction.editReply("Ocorreu um erro ao verificar seu perfil.");
            return;
        }

        if (hasUrlInStatus(member.presence)) {
            // Adiciona os cargos
            await member.roles.add([ROLE_ID_1, ROLE_ID_2]);
            await interaction.editReply("URL verificada! Os benefícios foram adicionados ao seu perfil.");
        } else {
            await interaction.editReply(`Por favor, adicione **${URL_TO_CHECK}** na sua barra de status personalizado e tente novamente.`);
        }
    });

    // Evento para monitorar a remoção do URL
    client.on("presenceUpdate", async (oldPresence: Presence | null, newPresence: Presence) => {
        const member = newPresence.member;
        if (!member) return;

        // Verifica se o membro tinha a URL e a removeu
        const hadUrl = hasUrlInStatus(oldPresence);
        const hasUrlNow = hasUrlInStatus(newPresence);

        if (hadUrl && !hasUrlNow) {
            // Remove os cargos
            await member.roles.remove([ROLE_ID_1, ROLE_ID_2]);

            // Envia uma DM para o usuário
            try {
                await member.user.send(
                    `Você removeu a url **${URL_TO_CHECK}** da sua barra de status e perdeu os benefícios. ` +
                    `Adicione-a novamente para ter os benefícios de volta!`
                );
            } catch (error) {
                console.error(`Não foi possível enviar DM para ${member.user.tag}: ${error}`);
            }
        } else if (!hadUrl && hasUrlNow) {
            // Adiciona os cargos novamente se o usuário adicionar a URL de volta
            await member.roles.add([ROLE_ID_1, ROLE_ID_2]);
        }
    });
}
