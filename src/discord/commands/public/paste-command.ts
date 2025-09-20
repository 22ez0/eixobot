// paste-command.ts

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ChannelType, PermissionsBitField } from 'discord.js';
import * as fs from 'fs';

const COMMAND_NAME = 'paste';

export const data = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription('Cola a estrutura do servidor a partir de um JSON.')
  .toJSON();

export async function execute(interaction: CommandInteraction): Promise<any> {
  if (!interaction.guild || !interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const fileName = `server-structure-${guild.id}.json`;

  if (!fs.existsSync(fileName)) {
    return interaction.editReply({ content: `O arquivo \`${fileName}\` não foi encontrado. Use o comando \`/copy\` primeiro.` });
  }

  const fileContent = fs.readFileSync(fileName, 'utf-8');
  const structure = JSON.parse(fileContent);

  // Mapeamento de categorias criadas para evitar duplicações
  const categoryMap: { [key: string]: string } = {};

  try {
    // 1. Criar categorias
    for (const cat of structure.categories) {
      const newCategory = await guild.channels.create({
        name: cat.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: cat.permissions.map((perm: any) => ({
          id: perm.id,
          allow: BigInt(perm.allow),
          deny: BigInt(perm.deny)
        }))
      });
      categoryMap[cat.name] = newCategory.id;
    }

    // 2. Criar canais
    for (const ch of structure.channels) {
      let parentId = null;
      if (ch.parent && categoryMap[ch.parent]) {
        parentId = categoryMap[ch.parent];
      }

      const channelOptions = {
        name: ch.name,
        type: ch.type,
        parent: parentId,
        permissionOverwrites: ch.permissions.map((perm: any) => ({
          id: perm.id,
          allow: BigInt(perm.allow),
          deny: BigInt(perm.deny)
        }))
      };

      if (ch.type === ChannelType.GuildText) {
        await guild.channels.create(channelOptions as any);
      } else if (ch.type === ChannelType.GuildVoice) {
        await guild.channels.create(channelOptions as any);
      }
    }

    await interaction.editReply({ content: `A estrutura do servidor foi colada com sucesso!` });

  } catch (error) {
    console.error('Erro ao colar a estrutura do servidor:', error);
    await interaction.editReply({ content: 'Ocorreu um erro ao colar a estrutura. Verifique as permissões do bot.' });
  }
}
