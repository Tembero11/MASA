import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
// import { BackupType, createBackup } from "../backup";
import { getDefaultCommandEmbed } from "../helpers";
import Command, { RegisteredCommand } from "./general";
import { PermissionScope } from "../classes/PermissionManager";

@RegisteredCommand
export class BackupCommand extends Command {
  name = "backup";
  desc = "Create a backup";
  aliases = [];
  builder = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.desc)
    .addStringOption(option => option.setName("server").setDescription("Enter the name of the server you want to backup").setRequired(true))
    .addStringOption(option => option.setName("name").setDescription("Enter the name of the backup").setRequired(false))
    .addStringOption(option => option.setName("description").setDescription("Describe the backup").setRequired(false));

  readonly permissionScopes = [
    PermissionScope.ManageBackups
  ];
    
  handler = async (interaction: CommandInteraction): Promise<void> => {
    let embed = getDefaultCommandEmbed(interaction.user.username, interaction.user.avatarURL());

    let serverName = interaction.options.getString("server");
    // if (serverName) {
    //   let server = ServerHandler.getServerByName(serverName);
    //   if (server) {
    //     if (server.backups) {
    //       const backupName = interaction.options.getString("name") || undefined;
    //       const desc = interaction.options.getString("description") || undefined;
    
    //       let backup = await server.backups.createUser(backupName, desc, interaction.member?.user.id);
    //       embed.setDescription(Lang.parse("commands.backup.backupCreated", {BACKUP_NAME: backup.id}));
    //     }else {
    //       embed.setDescription(Lang.parse("commands.backup.backupsNotEnabled", {SERVER_NAME: serverName}));
    //     }
    //   }else {
    //     embed.setDescription(Lang.parse("common.serverNotFound", {SERVER_NAME: serverName}));
    //   }
    // }
    await interaction.reply({embeds: [embed]}); 
  };
}