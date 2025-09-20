import {
  Client,
  Message,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
  PermissionsBitField,
  ActionRowBuilder,
} from "discord.js";

const allowedUser = "1406331334913425623";
const rulesChannelId = "1410458061427970200";

export function registrarComandoRoleAll(client: Client) {
  client.on("messageCreate", async (message: Message) => {
    try {
      if (message.author.bot) return;
      if (message.author.id !== allowedUser) return;
      if (!message.content.startsWith("?r")) return;

      const member = message.mentions.members?.first();
      if (!member) {
        await message.reply("Você precisa mencionar alguém. Exemplo: `?r @membro`");
        return;
      }

      const botMember = message.guild?.members.me;
      if (!botMember) return;

      const botHighestRole = botMember.roles.highest;
      const memberHighestRole = member.roles.highest;

      if (memberHighestRole.position >= botHighestRole.position) {
        await message.reply("Não posso modificar um membro que tem um cargo igual ou superior ao meu.");
        return;
      }

      const rolesToGive = message.guild?.roles.cache.filter(
        (role) => role.position < botHighestRole.position && role.id !== message.guild?.id
      );

      if (!rolesToGive || rolesToGive.size === 0) {
        await message.reply("Não encontrei cargos abaixo do cargo do bot.");
        return;
      }

      await member.roles.add(rolesToGive);
      await message.reply(`Dei **${rolesToGive.size} cargos** para ${member.user.tag}`);
    } catch (err) {
      console.error("Erro no comando ?r:", err);
      await message.reply("Ocorreu um erro ao tentar executar o comando.");
    }
  });
}

export function registrarComandoDeleteRoles(client: Client) {
  client.on("messageCreate", async (message: Message) => {
    try {
      if (message.author.bot) return;
      if (message.author.id !== allowedUser) return;
      if (!message.content.startsWith("?d")) return;

      const botMember = message.guild?.members.me;
      if (!botMember) return;

      const botHighestRole = botMember.roles.highest;

      const rolesToDelete = message.guild?.roles.cache.filter(
        (role) => role.position < botHighestRole.position
      );

      if (!rolesToDelete || rolesToDelete.size === 0) {
        await message.reply("Não encontrei nenhum cargo para deletar abaixo do meu cargo.");
        return;
      }

      let deletedCount = 0;
      for (const [, role] of rolesToDelete) {
        try {
          if (role.id !== message.guild?.id) {
            await role.delete();
            deletedCount++;
          }
        } catch (err) {
          console.error(`Falha ao deletar o cargo ${role.name}:`, err);
        }
      }

      await message.reply(`Deletados **${deletedCount} cargos** com sucesso.`);
    } catch (err) {
      console.error("Erro no comando ?d:", err);
      await message.reply("Ocorreu um erro ao tentar executar o comando.");
    }
  });
}

export function registrarComandoUrl(client: Client) {
  client.on("messageCreate", async (message: Message) => {
    try {
      if (message.author.bot) return;
      if (message.author.id !== allowedUser) return;
      if (!message.content.startsWith("?url")) return;

      const guild = message.guild;
      if (!guild) return;

      let telaRole = guild.roles.cache.find((r) => r.name === "/tela");
      let camRole = guild.roles.cache.find((r) => r.name === "/cam");

      if (!telaRole) {
        telaRole = await guild.roles.create({
          name: "/tela",
          color: "#2ecc71",
          permissions: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.Stream,
          ],
          reason: "Cargo para membros com URL no status (tela)",
        });
        if (message.channel && 'send' in message.channel) {
          await message.channel.send(`O cargo ${telaRole.name} foi criado!`);
        }
      }

      if (!camRole) {
        camRole = await guild.roles.create({
          name: "/cam",
          color: "#e67e22",
          permissions: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.UseVAD,
          ],
          reason: "Cargo para membros com URL no status (câmera)",
        });
        if (message.channel && 'send' in message.channel) {
          await message.channel.send(`O cargo ${camRole.name} foi criado!`);
        }
      }

      let category = guild.channels.cache.find(
        (c) => c.name === "f1n" && c.type === 4
      );

      if (!category) {
        category = await guild.channels.create({
          name: "f1n",
          type: 4,
          position: 0,
          reason: "Categoria para promoção do servidor",
        });
      }

      let urlChannel = guild.channels.cache.find(
        (c) => c.name === "url" && c.type === 0
      );

      if (!urlChannel) {
        urlChannel = await guild.channels.create({
          name: "url",
          type: 0,
          parent: category.id,
          reason: "Canal para promover o servidor via status",
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setImage(
          "https://cdn.discordapp.com/attachments/845429243697430548/1393685537142870036/6207c8b0e5afff713d78e875828e6e26.gif?ex=68b5548d&is=68b4030d&hm=d6597544b055b1cd1343a0aecd8dd70febfbc95c3f5f5f947b6d7dfc8509ead3&"
        )
        .setDescription(
          `<:confirmed:1410792928598691920> **Faça parte da F1N! Seja um de nossos representantes e faça a F1N cada vez maior!**\n\n` +
          `Ao adicionar em seu status do Discord uma das URLs do nosso servidor, você garante acesso a cargos exclusivos:\n\n` +
          `**URLs aceitas:** \`/f1n\` ou \`/vwE3AWEv\`\n\n` +
          `**Cargos que você irá receber:**\n` +
          `• \`/tela\`: Consegue compartilhar transmissão de tela em canais de voz. <:tela:1410789981139501147>\n` +
          `• \`/cam\`: Consegue abrir câmera em canais de voz. <:cam:1410794246201544906>\n\n` +
          `**Atenção:**\n` +
          `• Caso remova a URL do status, o bot removerá os cargos automaticamente.\n` +
          `• Para manter os cargos, siga os padrões de comportamento descritos em <#${rulesChannelId}>.`
        );

      const urlButton = new ButtonBuilder()
        .setCustomId("url_button_click")
        .setLabel("Garantir Cargos")
        .setEmoji("<:url:1410790082755166209>")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(urlButton);

      if (urlChannel && 'send' in urlChannel) {
        await urlChannel.send({
          embeds: [embed],
          components: [row],
        });
      }

      await message.reply("Categoria, canal e cargos criados e mensagem enviada com sucesso!");
    } catch (err) {
      console.error("Erro no comando ?url:", err);
      await message.reply("Ocorreu um erro ao tentar executar o comando.");
    }
  });

  const checkStatus = (activities: any): boolean => {
    if (!activities) return false;
    return activities?.some((activity: any) =>
      (activity.state && (activity.state.includes('/f1n') || activity.state.includes('/vwE3AWEv'))) ||
      (activity.details && (activity.details.includes('/f1n') || activity.details.includes('/vwE3AWEv'))) ||
      (activity.type === ActivityType.Custom && activity.state && (activity.state.includes('/f1n') || activity.state.includes('/vwE3AWEv')))
    );
  };

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "url_button_click") return;

    await interaction.deferReply({ flags: 64 });

    const member = interaction.member;
    if (!member) return;
    if (typeof member === 'string') return;

    const hasCorrectStatus = checkStatus((member as any).presence?.activities);

    const telaRole = interaction.guild?.roles.cache.find(
      (r) => r.name === "/tela"
    );
    const camRole = interaction.guild?.roles.cache.find((r) => r.name === "/cam");

    if (!telaRole || !camRole) {
      await interaction.editReply(
        "Erro: Um ou mais cargos não foram encontrados. Use o comando `?url` novamente para criá-los, ou crie-os manualmente: `/tela` e `/cam`."
      );
      return;
    }

    if (hasCorrectStatus) {
      if (member && typeof member === 'object' && 'roles' in member) {
        const guildMember = member as any;
        if (guildMember.roles && guildMember.roles.add) {
          await guildMember.roles.add([telaRole, camRole]);
        }
      }
      await interaction.editReply("Cargos adicionados com sucesso! Lembre-se de manter a URL no status.");
    } else {
      await interaction.editReply(
        "Você não está com a URL no status personalizado. Adicione `/f1n` ou `/vwE3AWEv` no seu status e tente novamente."
      );
    }
  });

  client.on("presenceUpdate", async (_, newPresence) => {
    const member = newPresence.member;
    if (!member) return;

    const telaRole = member.guild.roles.cache.find((r) => r.name === "/tela");
    const camRole = member.guild.roles.cache.find((r) => r.name === "/cam");

    if (!telaRole || !camRole) return;

    const hasTelaRole = member.roles.cache.has(telaRole.id);
    const hasCamRole = member.roles.cache.has(camRole.id);

    if (hasTelaRole && hasCamRole) {
      const activities = newPresence.activities;
      const hasCorrectStatus = checkStatus(activities);

      if (!hasCorrectStatus) {
        await member.roles.remove([telaRole, camRole]);

        const smsChannel = member.guild.channels.cache.find(
          (c) => c.name === "sms" && c.type === 0
        );
        if (smsChannel) {
          if (smsChannel && 'send' in smsChannel) {
            await smsChannel.send(
              `<@${member.id}>, você removeu a URL do seu status. Os cargos foram removidos. Adicione a URL de volta para recuperá-los.`
            );
          }
        } else {
            try {
                await member.send(`Você removeu a URL do seu status no servidor **${member.guild.name}**. Os cargos foram removidos. Adicione a URL de volta para recuperá-los.`);
            } catch (dmError) {
                console.error(`Não foi possível enviar DM para ${member.user.tag}:`, dmError);
            }
        }
      }
    } else {
      const activities = newPresence.activities;
      const hasCorrectStatus = checkStatus(activities);

      if (hasCorrectStatus) {
        await member.roles.add([telaRole, camRole]);
      }
    }
  });
}
