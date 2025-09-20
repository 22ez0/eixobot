import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder, ChannelType } from "discord.js";

createCommand({
    name: "rules",
    description: "Cria um canal de regras com as regras do servidor.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction): Promise<void> {
        if (!interaction.member.permissions.has("ManageGuild")) {
            await interaction.reply({
                content: "Você não tem permissão para usar este comando!",
                flags: 64,
            });
            return;
        }

        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({ content: "Este comando só pode ser usado em um servidor.", flags: 64 });
            return;
        }

        try {
            // Verifica se o canal 'rules' já existe
            let rulesChannel = guild.channels.cache.find(c => c.name === "rules" && c.type === ChannelType.GuildText);

            if (!rulesChannel) {
                rulesChannel = await guild.channels.create({
                    name: "rules",
                    type: ChannelType.GuildText,
                    topic: "Regras do servidor",
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            allow: ["ViewChannel", "ReadMessageHistory"],
                            deny: ["SendMessages"]
                        }
                    ]
                });
            }

            await interaction.reply({ content: `Canal de regras criado ou encontrado: ${rulesChannel}!`, flags: 64 });

            const rulesEmbeds = [
                new EmbedBuilder()
                    .setImage("https://cdn.discordapp.com/attachments/862489570259632138/1283944089137446952/e01d8b1622b89eff8ead122558b0f3f8.jpg?ex=68b0485d&is=68aef6dd&hm=0f7cfbf2c1197903ee2206341aea0b951fc8553cb18fdc9ae8917fdcf54d8870&")
                    .setDescription(`**Diretrizes do discord** \n\n**Respeito:**\nTratar todos os membros com respeito, sem assédio, discurso de ódio ou qualquer forma de discriminação.\n\n**Conteúdo:**\nEvitar conteúdo inadequado, como material com restrição de idade, obsceno ou que viole direitos de propriedade intelectual.\n\n**Segurança:**\nDenunciar atividades suspeitas ou conteúdo que viole as diretrizes para a equipe de moderação ou diretamente ao Discord.\n\n**Comunicação:**\nPromover um ambiente acolhedor e positivo, incentivando interações saudáveis e construtivas.`)
                    .setColor("#00070b"),

                new EmbedBuilder()
                    .setDescription(`**Consequências:**\nO desrespeito às diretrizes pode levar a ações punitivas, incluindo remoção do servidor ou suspensão da conta.\n\n**Requisitos para Servidores:**\n**Regras claras:**\nServidores devem estabelecer regras claras sobre o que é permitido e proibido em seus espaços.\n\n**Equipe de moderação:**\nContar com uma equipe de moderação para aplicar as regras e garantir o cumprimento das diretrizes.\n\n**Canal de regras:**\nTer um canal visível para todos os membros com as regras do servidor.\n\n**Respeito às diretrizes do Discord:**\nServidores devem seguir as Diretrizes da Comunidade e os Termos de Serviço do Discord.\n\n**Importância das Diretrizes:**\nAs diretrizes do Discord são cruciais para manter a plataforma segura e agradável para todos. Elas ajudam a criar um ambiente onde os usuários se sintam seguros para se expressar, interagir e construir comunidades sem medo de serem prejudicados.`)
                    .setFooter({ text: "Acabou de ler? Confira #server." })
                    .setImage("https://cdn.discordapp.com/attachments/862489570259632138/1283944088499916830/4cc7f94cc580f599c4f7610fa16eda3f.jpg?ex=68b0485d&is=68aef6dd&hm=06ce80ceb293f75c07f15b0ee912437d56c09102713b4705db5ed3b04f0c10c3&")
                    .setColor("#00070b")
            ];

            if (rulesChannel && 'send' in rulesChannel) {
                await rulesChannel.send({ embeds: rulesEmbeds });
            }

        } catch (error) {
            console.error("Erro ao criar o canal de regras:", error);
            await interaction.reply({ content: "Ocorreu um erro ao tentar criar o canal de regras.", flags: 64 });
        }
    }
});
