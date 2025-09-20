import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = '1418330610942087282'; // O ID do seu servidor
const BOT_TOKEN = process.env.BOT_TOKEN;

const commands = [
  new SlashCommandBuilder()
    .setName('verificar')
    .setDescription('Cria um canal de verificação e configura as permissões.'),
];

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('Iniciando o registro de comandos de slash...');

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log('Comandos de slash registrados com sucesso!');
  } catch (error) {
    console.error('Ocorreu um erro ao registrar os comandos:', error);
  }
})();
