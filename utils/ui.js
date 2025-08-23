import { EmbedBuilder } from 'discord.js';

export const UI_COLORS = {
	primary: 0x5865F2,
	success: 0x57F287,
	warn: 0xFEE75C,
	danger: 0xED4245,
	info: 0x00BFFF,
};

export function createEmbed({
	title,
	description,
	color = UI_COLORS.primary,
	url,
	fields,
	thumbnail,
	footer,
	timestamp = true,
} = {}) {
	const embed = new EmbedBuilder();
	if (title) embed.setTitle(title);
	if (description) embed.setDescription(description);
	if (url) embed.setURL(url);
	if (thumbnail) embed.setThumbnail(thumbnail);
	if (fields && Array.isArray(fields) && fields.length) embed.addFields(fields);
	if (footer) embed.setFooter(typeof footer === 'string' ? { text: footer } : footer);
	if (timestamp) embed.setTimestamp();
	embed.setColor(color);
	return embed;
}

