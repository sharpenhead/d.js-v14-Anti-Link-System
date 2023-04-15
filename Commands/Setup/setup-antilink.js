const {
    ActionRowBuilder,
    ButtonBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
} = require("discord.js");
const linkSchema = require("../../Models/antilink"); // Remember to fix the file paths if it does not match yours.
const antilinkLogSchema = require("../../Models/antilinkLogChannel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-antilink")
        .setDescription("Prevent members on the Discord server from sending links.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Change this permission if you would like to.
        .addStringOption(option =>
            option.setName("permissions")
                .setDescription("*Choose the permission to bypass the anti-link system.")
                .setRequired(true)
                .addChoices(
                    { name: "Manage Channels", value: "ManageChannels" },
                    { name: "Manage Server", value: "ManageGuild" },
                    { name: "Embed Links", value: "EmbedLinks" },
                    { name: "Attach Files", value: "AttachFiles" },
                    { name: "Manage Messages", value: "ManageMessages" },
                    { name: "Administrator", value: "Administrator" },
                )
        )
        .addChannelOption(option =>
            option.setName("log-channel")
                .setDescription("*Choose the channel for logging violations.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    /**
    * @param {Client} client
    * @param {ChatInputCommandInteraction} interaction
    */
    async execute(interaction, client) {
        const guild = interaction.guild;
        const permissions = interaction.options.getString("permissions");
        const logChannel = interaction.options.getChannel("log-channel");

        await interaction.deferReply();

        let requireDB = await linkSchema.findOne({ _id: guild.id });
        let logSchema = await antilinkLogSchema.findOne({ Guild: guild.id });

        if (logSchema) {
            await antilinkLogSchema.create({
                Guild: guild.id,
                Perms: permissions,
                logChannel: logChannel.id
            })
        } else if (!logSchema) {
            await antilinkLogSchema.create({
                Guild: guild.id,
                Perms: permissions,
                logChannel: logChannel.id
            })
        }

        const sistema = requireDB?.logs === true ? "📗 Activated" : "📕 Disabled";

        const e2 = new EmbedBuilder()
            .setTitle(`🔗 Antilink`)
            .setThumbnail(client.user.displayAvatarURL())
            .setColor(mainColor)
            .setImage("https://cdn.discordapp.com/attachments/921924771883667467/1059914271926014012/standard_2.gif")
            .setDescription(
                `Antilink from ${interaction.guild.name}\n\nThe system is currently [\`${sistema}\`](https://discord.gg/kajdev).\nUse the button below to configure the server's antiscam status.\nBypass permission: ${permissions}.\nCurrent log-channel: <#${logChannel.id}>.`
            )
            .setFooter({
                text: guild.name,
                iconURL: guild.iconURL({ dynamic: true }),
            })
            .setTimestamp(new Date());

        const b = new ButtonBuilder()
            .setLabel(`Activate`)
            .setCustomId(`true`)
            .setStyle(3)
            .setEmoji(`📗`);

        const b1 = new ButtonBuilder()
            .setLabel(`Disable`)
            .setCustomId(`false`)
            .setStyle(4)
            .setEmoji(`📕`);

        const ac = new ActionRowBuilder().addComponents(b, b1);

        const tf = await interaction.editReply({ embeds: [e2], components: [ac] });

        const coll = tf.createMessageComponentCollector();

        coll.on("collect", async (ds) => {
            if (ds.user.id !== interaction.user.id) return;

            if (ds.customId === `true`) {
                const e = new EmbedBuilder()
                    .setDescription(`📗 Antilink system has been set to **Active**!`)
                    .setColor("Aqua");

                ds.update({ embeds: [e], components: [] });

                await linkSchema.findOneAndUpdate(
                    { _id: guild.id },
                    {
                        $set: { logs: true },
                    },
                    { upsert: true }
                );
            } else if (ds.customId === `false`) {
                const e = new EmbedBuilder()
                    .setDescription(`📕 Antilink system has been set to **Disabled**!`)
                    .setColor("Red");

                ds.update({ embeds: [e], components: [] });

                await linkSchema.findOneAndUpdate(
                    { _id: guild.id },
                    {
                        $set: { logs: false },
                    },
                    { upsert: true }
                );
            }
        });
    }
}
