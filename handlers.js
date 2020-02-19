const knownCommands = require('./functions/index');
const version = require('./package').version;

// Called every time a message comes in:
const onCall = item => {
	const deckIdRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
	const types = {
		cards: /\[(.*?)]/g,
		deck: /{([^}]+)}/g,
	};
	let text = item.body.toLowerCase();
	const flags = text.split(' ').filter(a => a.startsWith('-')).map(flag => flag.slice(1));
	let params = [];
	let command = false;
	Object.keys(types).forEach(type => {
		let found = [];
		let curMatch;
		while (curMatch = types[type].exec(text)) {
			if(curMatch[1]) found.push(curMatch[1].replace(/[\\_]+/g, ' ').trim());
		}
		if(found.length > 0) {
			params = found.filter(Boolean);
			command = type;
		}
	});
	if(deckIdRegex.test(text)) {
		command = 'deck';
		params = text.split(' ').map(param => {
			if(deckIdRegex.test(param)) return (param.match(deckIdRegex)[0]);
		}).filter(Boolean);
	}

	if(!command) return;

	// If the command is known, let's execute it:
	if(command in knownCommands) {
		console.log(`${item.author.name}, ${command}, ${params}, ${flags}, ${new Date()}, ${item.link_permalink}`);
		knownCommands[command](item, params, flags);
	}

};

// Called every time the bot connects to Twitch chat:
const onReady = client => {
	console.log(`Logged in as ${client.user.username}!`);
	console.log(`Version: ${version}`);
};

exports.onCall = onCall;
exports.onReady = onReady;
