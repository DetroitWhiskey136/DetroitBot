module.exports = {
	name: 'ping',
	aliases: [],
	description: 'Ping!',
	cooldown: 5,
	args: false,
	guildOnly: false,
	execute(client, message) {
		message.channel.send(`Pong! ~ ${Math.round(client.ping)}ms`);
	},
};