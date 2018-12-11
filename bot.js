const fs = require('fs');
const DiscordJS = require('discord.js');
const Canvas = require('canvas');
// const snekfetch = require('snekfetch');
const { prefix, bot_token } = require('./data/settings/config.json');
const { channels } = require('./data/settings/general.json');

const client = new DiscordJS.Client();
const cooldowns = new DiscordJS.Collection();
client.commands = new DiscordJS.Collection();

const commandFiles = fs.readdirSync('./data/commands').filter(file => file.endsWith('js'));

for (const file of commandFiles) {
	const command = require(`./data/commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('guildMemberAdd', async member => {
	const channel = member.guild.channels.find(ch => ch.id === channels.log);
	if (!channel) return;

	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage('./data/img/wallpaper.png');

	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	// Select the color of the stroke
	ctx.strokeStyle = '#74037b';
	// Draw a rectangle with the dimensions of the entire canvas
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	const attachment = new DiscordJS.Attachment(canvas.toBuffer(), 'welcome-image.png');


	channel.send(`Welcome to the server, ${member}`, attachment);
});

client.on('message', message => {
	if (!message.content.startsWith(prefix.main) || message.author.bot) return;

	const args = message.content.slice(prefix.main.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DM\'s!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix.main}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new DiscordJS.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(client, message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});

client.on('message', async message => {
	if (message.content === '!join') {
		client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
	}
});

client.login(bot_token);