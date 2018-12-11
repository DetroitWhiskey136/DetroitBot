module.exports = {
	name: 'member',
	aliases: [],
	description: 'Member info',
	cooldown: 5,
	args: false,
	guildOnly: false,
	execute(client, message) {
		message.channel.send(`Your Username: ${message.author.username} \nYour ID: ${message.author.id}`);
	},
};