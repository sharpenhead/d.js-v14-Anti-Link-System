const {
    Client,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const linkSchema = require("../../Models/antilink");
const antilinkLogSchema = require("../../Models/antilinkLogChannel");
const ms = require("ms");

module.exports = {
    name: "messageCreate",
    /**
     * @param {Client} client
     */
    async execute(msg, client) {
        if (!msg.guild) return;
        if (msg.author?.bot) return;

        let requireDB = await linkSchema.findOne({ _id: msg.guild.id });
        const data = await antilinkLogSchema.findOne({ Guild: msg.guild.id });

        if (!requireDB) return;

        if (requireDB.logs === false) return;

        if (requireDB.logs === true) {

            const memberPerms = data.Perms;

            const user = msg.author;
            const member = msg.guild.members.cache.get(user.id);

            if (member.permissions.has(memberPerms)) return;

            else {
                const e = new EmbedBuilder()
                    .setDescription(`:warning: | Links are not allowed in this server, ${user}.`)
                    .setColor(warningColor);

                const url =
                    /((([(https)(http)]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
                // Créditos pela regex: Tech Boy

                setTimeout(async () => {
                    if (url.test(msg) || msg.content.includes("discord.gg/")) {
                        msg.channel
                            .send({ embeds: [e] })
                            .then((mg) => setTimeout(mg.delete.bind(mg), 10000));
                        msg.delete();

                        return;
                    }
                }, 2000); // Coloquei um limite de tempo pra evitar ratelimit

                const logChannel = client.channels.cache.get(data.logChannel);

                if (!logChannel) return;
                else {
                    const buttons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel("Timeout")
                                .setEmoji("🔨")
                                .setCustomId("linktimeout")
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setLabel("Kick")
                                .setEmoji("🛠️")
                                .setCustomId("linkkick")
                                .setStyle(ButtonStyle.Danger)
                        );

                    // For sending message to log channel.
                    const text = await logChannel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(mainColor)
                                .setDescription(`<@${user.id}> has been warned for sending a link.\n\`\`\`${msg.content}\`\`\``)
                                .setFooter({ text: `User ID: ${user.id}` })
                                .setTimestamp()
                        ],
                        components: [buttons]
                    });

                    const col = await text.createMessageComponentCollector();

                    col.on("collect", async (m) => {
                        switch (m.customId) {
                            case "linktimeout": {
                                if (!m.member.permissions.has(PermissionFlagsBits.ModerateMembers))
                                    return m.reply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor(warningColor)
                                                .setDescription(`:warning: | ${m.user.name} is missing the *moderate_members* permission, please try again after you gain this permission.`)
                                        ],
                                        ephemeral: true,
                                    });

                                if (!msg.member) {
                                    return m.reply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setDescription(`:warning: | The target specified has most likely left the server.`)
                                                .setColor(warningColor)
                                        ],
                                        ephemeral: true,
                                    });
                                }

                                m.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(successColor)
                                            .setDescription(`:white_check_mark: | ${msg.member} has been successfully timed out for 10 minutes.`)
                                    ],
                                    ephemeral: true,
                                });

                                const timeoutEmbed = new EmbedBuilder()
                                    .setTitle("Timeout")
                                    .setDescription(
                                        `You have received a timeout from \`${msg.guild.name}\` for sending links.`
                                    )
                                    .setTimestamp()
                                    .setColor(warningColor);

                                msg.member
                                    .send({
                                        embeds: [timeoutEmbed],
                                    })
                                    .then(() => {
                                        const time = ms("10m");
                                        msg.member.timeout(time);
                                    });
                            }
                                break;

                            case "linkkick": {
                                if (!m.member.permissions.has(PermissionFlagsBits.KickMembers))
                                    return m.reply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor(warningColor)
                                                .setDescription(`:warning: | ${m.user.name} is missing the *kick_members* permission, please try again after you gain this permission.`)
                                        ],
                                        ephemeral: true,
                                    });

                                const kickEmbed = new EmbedBuilder()
                                    .setTitle("Kicked")
                                    .setDescription(
                                        `:warning: | You have been kicked from \`${msg.guild.name}\` for sending links.`
                                    )
                                    .setTimestamp()
                                    .setColor(warningColor);

                                if (!msg.member) {
                                    return m.reply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setDescription(`:warning: | The target specified has most likely left the server.`)
                                                .setColor(warningColor)
                                        ],
                                        ephemeral: true,
                                    });
                                }

                                m.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(successColor)
                                            .setDescription(`:white_check_mark: | ${msg.member} has been successfully kicked from the server.`)
                                    ],
                                    ephemeral: true,
                                });

                                msg.member
                                    .send({
                                        embeds: [kickEmbed],
                                    })
                                    .then(() => {
                                        msg.member.kick({ reason: "Sending links." });
                                    });
                            }
                                break;
                        }
                    });
                }
            }
        }
    },
};
