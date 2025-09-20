import { createCommand } from "#base";
import { 
    ApplicationCommandType, 
    EmbedBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    ChannelType,
    TextChannel,
    PermissionsBitField,
} from "discord.js";

createCommand({
    name: "url",
    description: "Cria o canal de verificação de URL.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Verifica se o usuário é um administrador
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "Você não tem permissão para usar este comando.",
                flags: 64
            });
            return;
        }

        const channelName = "/eixo";
        let verificationChannel = interaction.guild?.channels.cache.find(
            (channel) => channel.name === channelName && channel.type === ChannelType.GuildText
        );

        if (!verificationChannel) {
            verificationChannel = await interaction.guild?.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages],
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    }
                ],
            });
        }

        const verifyEmbed = new EmbedBuilder()
            .setColor("#00070c")
            .setTitle("<:verify:1418642550633398323> SEJA REPRESENTANTE!")
            .setDescription(
                `> adicione a url **/eixo** na sua barra de status do discord e garanta benefícios como:\n\n` +
                `> <:tela:1418642959527841944> tela: consegue transmitir tela em canais de voz.\n` +
                `> <:like:1418642899922321669> cam: consegue abrir sua camêra em canais de voz.\n\n` +
                `_**Caso remova a url, o bot removerá os benefícios.**_`
            )
            .setImage("https://cdn.discordapp.com/attachments/1418363158179086447/1418391568758476990/IMG_0030.png?ex=68cdf396&is=68cca216&hm=4d6c417c5c1aee9e760491e0e7939b4bc62e2ff18c07e6b833719331ea245874&");

        const verifyButton = new ButtonBuilder()
            .setCustomId("verify_url_button")
            .setLabel(" ") // Botão com label vazia para ser transparente
            .setEmoji("<:url:1412508718276546580>")
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().addComponents(verifyButton);

        const channel = verificationChannel as TextChannel;
        await channel.send({ embeds: [verifyEmbed], components: [actionRow as any] });

        await interaction.reply({
            content: `Canal **${channelName}** criado e mensagem enviada.`,
            flags: 64
        });
    }
});
