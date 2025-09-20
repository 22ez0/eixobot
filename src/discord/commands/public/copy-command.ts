// copy-command.ts

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ChannelType, PermissionsBitField, GuildChannel, CategoryChannel } from 'discord.js';
import * as fs from 'fs';

const COMMAND_NAME = 'copy';

export const data = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription('Copia a estrutura completa do servidor (categorias e canais).')
  .toJSON();

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (!interaction.guild || !interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const everyoneRole = guild.roles.everyone;
  const everyonePermissions = everyoneRole.permissions.bitfield.toString();

  const structure = {
    name: guild.name,
    everyonePermissions: everyonePermissions,
    categories: [] as any[],
    channels: [] as any[]
  };

  const channels = guild.channels.cache.sort((a, b) => {
    const aPos = 'position' in a ? a.position : 0;
    const bPos = 'position' in b ? b.position : 0;
    return aPos - bPos;
  });

  for (const [, channel] of channels) {
    if (channel.type === ChannelType.GuildCategory) {
      const category = channel as CategoryChannel;
      const categoryData = {
        name: category.name,
        position: category.position,
        permissions: [] as any[]
      };

      category.permissionOverwrites.cache.forEach(perm => {
        if (perm.id === everyoneRole.id) {
          categoryData.permissions.push({
            id: perm.id,
            allow: perm.allow.bitfield.toString(),
            deny: perm.deny.bitfield.toString(),
          });
        }
      });
      structure.categories.push(categoryData);
    }
  }

  for (const [, channel] of channels) {
    if (channel.type !== ChannelType.GuildCategory) {
      const parent = channel.parent;
      const channelData = {
        name: channel.name,
        type: channel.type,
        parent: parent ? parent.name : null,
        position: 'position' in channel ? channel.position : 0,
        permissions: [] as any[]
      };

      (channel as GuildChannel).permissionOverwrites.cache.forEach(perm => {
        if (perm.id === everyoneRole.id) {
          channelData.permissions.push({
            id: perm.id,
            allow: perm.allow.bitfield.toString(),
            deny: perm.deny.bitfield.toString(),
          });
        }
      });
      structure.channels.push(channelData);
    }
  }

  const jsonContent = JSON.stringify(structure, null, 2);
  const fileName = `server-structure-${guild.id}.json`;

  fs.writeFileSync(fileName, jsonContent);

  await interaction.editReply({ content: `A estrutura do servidor foi copiada para o arquivo \`${fileName}\`!` });
}
