import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, TextChannel } from "discord.js";

const verifiedRoleId = '1418700920363155476';

createCommand({
    name: "verificar",
    description: "Cria um canal de verificação e configura as permissões.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const member = interaction.member;
        const guild = interaction.guild;

        if (!member || !guild) {
            await interaction.reply({
                content: 'Este comando só pode ser usado em um servidor.',
                ephemeral: true,
            });
            return;
        }

        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: 'Você não tem permissão para usar este comando!',
                ephemeral: true,
            });
            return;
        }

        const everyoneRoleId = guild.roles.everyone.id;
        try {
            const verifiedRole = await guild.roles.fetch(verifiedRoleId);
            if (!verifiedRole) {
                await interaction.reply({
                    content: 'Cargo de verificado não encontrado. Configure o ID corretamente.',
                    ephemeral: true,
                });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            let verificationChannel = guild.channels.cache.find(
                (c) => c.name === '│verificação' && c.type === ChannelType.GuildText
            ) as TextChannel | undefined;

            if (!verificationChannel) {
                verificationChannel = await guild.channels.create({
                    name: '│verificação',
                    type: ChannelType.GuildText,
                    topic: 'Canal para verificação de novos membros.',
                    permissionOverwrites: [
                        {
                            id: everyoneRoleId,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                            deny: [PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: verifiedRoleId,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                }) as TextChannel;
            }

            guild.channels.cache.forEach(async (channel) => {
                if (!channel) return;
                if (channel.type === ChannelType.GuildCategory || channel.isTextBased() || channel.isVoiceBased()) {
                    if ('permissionOverwrites' in channel) {
                        await channel.permissionOverwrites.edit(everyoneRoleId, {
                            ViewChannel: false,
                        });
                        await channel.permissionOverwrites.edit(verifiedRoleId, {
                            ViewChannel: true,
                            SendMessages: true,
                        });
                    }
                }
            });

            if (verificationChannel) {
                await verificationChannel.permissionOverwrites.edit(everyoneRoleId, {
                    ViewChannel: true,
                });
            }

            const verifyEmbed = new EmbedBuilder()
                .setColor('#270018')
                .setImage(
                    'https://cdn.discordapp.com/attachments/1418423747542519830/1418892220961918976/a87736d3cb428e4476ce0877842540ca.jpg?ex=68cfc5db&is=68ce745b&hm=6b65268d6ff0d58520010818be210a1d6460ab0b73dd1474b0f719a04d1be467&'
                )
                .setDescription('Para ter acesso aos canais, clique no botão para se verificar!');

            const verifyButton = new ButtonBuilder()
                .setCustomId('verify_button')
                .setLabel('Verifique-se!')
                .setEmoji('<a:1035296873856127046:1036420544528130068>')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

            await verificationChannel.send({ embeds: [verifyEmbed], components: [row] });
            await interaction.editReply({
                content: `Canal de verificação criado e permissões configuradas em ${verificationChannel}.`,
            });

        } catch (error) {
            console.error('Erro ao criar o canal de verificação:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro ao tentar criar o canal de verificação. Verifique as permissões do bot.',
            });
        }
    },
});