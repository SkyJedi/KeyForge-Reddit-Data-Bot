const Snoowrap = require('snoowrap');
const { CommentStream, SubmissionStream } = require('snoostorm');
const config = require('./config');
const handlers = require('./handlers');
const BOT_START = Date.now() / 1000;

const client = new Snoowrap(config.credentials);

// Options object is a Snoowrap Listing object, but with subreddit and pollTime options
const comments = new CommentStream(client, { subreddit: config.subreddit, limit: 10, pollTime: 2000 });

comments.on('item', item => {
	if(item.created_utc < BOT_START) return;
	if(item.author.name === config.credentials.username) return;
	if(item.author.name === 'ArchonArcanaBot') return;
	handlers.onCall(item);
});

const submissions = new SubmissionStream(client, { subreddit: config.subreddit, limit: 10, pollTime: 2000 });
submissions.on('item', item => {
	if(item.created_utc < BOT_START) return;
	if(item.author.name === config.credentials.username) return;
	if(item.author.name === 'ArchonArcanaBot') return;
	if (item.selftext) item.body = item.selftext;
	handlers.onCall(item);
});

const sendMessage = (item, text) => item.reply(text);

exports.sendMessage = sendMessage;