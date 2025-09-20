import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "automod",
    description: "Confirma se o sistema de automod está ativo",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.reply({
            content: "automod ativado.",
            flags: 64
        });
    }
});
