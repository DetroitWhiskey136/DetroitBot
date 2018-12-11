module.exports = {
	name: 'guild',
	aliases: ['server'],
	description: 'Guild info',
	cooldown: 5,
	args: false,
	guildOnly: true,
	execute(client, message) {
		message.channel.send(`Guild Name: ${message.guild.name} \nTotal Members: ${message.guild.memberCount}`);
	},
};