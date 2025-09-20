import { Client, ActivityType } from "discord.js";
import { joinVoiceChannel } from '@discordjs/voice';

// IDs do servidor e do canal de voz
const guildId = '1418330610942087282';
const voiceChannelId = '1418330613055750278';

// Lista de status para alternar
const streamingStatusList = [
  'desenvolvido por vegas!',
  'entre no servidor!',
  'tô de olho no chat hein!',
  'siga-nos nas redes sociais: ig: vv3hs, tiktok: eixoserver!'
];

// Variável para controlar o índice da lista
let currentIndex = 0;

/**
 * Configura o status de transmissão do bot e faz ele entrar em um canal de voz.
 * @param {Client} client O cliente do Discord.
 */
export const handleVoiceAndStatus = (client: Client) => {
  // URL da Twitch para o status de 'Streaming'
  const twitchUrl = 'https://www.twitch.tv/alanzoka';

  // Aguardar um pouco antes de definir presence (evitar erro de shard)
  setTimeout(() => {
    try {
      // --- Mudar o status inicialmente ---
      client.user?.setPresence({
        activities: [{
          name: streamingStatusList[currentIndex],
          type: ActivityType.Streaming,
          url: twitchUrl,
        }],
        status: 'online',
      });
      currentIndex = (currentIndex + 1) % streamingStatusList.length;
    } catch (error) {
      console.log('⚠️ Erro ao definir presence:', error instanceof Error ? error.message : String(error));
    }
  }, 3000); // 3 segundos de delay

  // --- Encontrar e entrar no canal de voz (com delay) ---
  setTimeout(() => {
    try {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        const channel = guild.channels.cache.get(voiceChannelId);
        if (channel?.isVoiceBased()) {
          joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
          });
          console.log(` Bot entrou no canal de voz: ${channel.name}`);
        } else {
          console.log(' Canal de voz não encontrado no servidor especificado.');
        }
      } else {
        console.log(' Servidor não encontrado.');
      }
    } catch (error) {
      console.log('⚠️ Erro ao conectar no canal de voz:', error instanceof Error ? error.message : String(error));
    }
  }, 5000); // 5 segundos de delay

  // --- Loop para mudar o status a cada 10 segundos (com verificação) ---
  setTimeout(() => {
    setInterval(() => {
      try {
        if (client.user && client.isReady()) {
          client.user.setActivity(streamingStatusList[currentIndex], { 
            type: ActivityType.Streaming,
            url: twitchUrl,
          });
          currentIndex = (currentIndex + 1) % streamingStatusList.length;
        }
      } catch (error) {
        console.log('⚠️ Erro ao atualizar status:', error instanceof Error ? error.message : String(error));
      }
    }, 10000); // 10000 milissegundos = 10 segundos
  }, 8000); // Começar após 8 segundos
};
