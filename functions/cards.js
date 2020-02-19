const main = require('../index');
const { fetchCard, fetchReprints, getSet, getCardLink, rarityFix } = require('./fetch');
const { upperFirst } = require('lodash');

const cards = (item, params, flags) => {
	params = params.slice(0, 5);
	//fetch cards data
	const cards = params.map(card => fetchCard(card, flags)).filter(Boolean);
	if(0 >= cards.length) return;
	const text = cards.map(card => {
		return [
			'card_title',
			'expansion',
			'house',
			'card_type',
			'traits',
			'amber',
			'power',
			'armor',
			'rarity',
			'card_text',
			'flavor_text'].map(type => {
			if(card[type] === 0 || !card[type]) return '';
			switch (type) {
				case 'card_title':
					return `__[${card[type]}](${getCardLink(card)})__ • `;
				case 'amber':
					return `Æmber: ${card[type]} •`;
				case 'power':
				case 'armor':
					return `${upperFirst(type)}: ${card[type]} •`;
				case 'flavor_text':
					if(card[type])
						return `• ${card[type]}`;
					break;
				case 'card_text':
					return `${card[type]}`;
				case 'expansion':
					const reprints = fetchReprints(card, flags);
					return reprints.map(x => `${getSet(x.expansion)} (${x.card_number})`).join(' • ') + ' • ';
				case 'rarity':
					return `${rarityFix(card[type])} •`;
				default:
					return `${card[type]} •`;
			}
		}).join(' ');
	}).join('\n\n');
	main.sendMessage(item, text);
};

exports.cards = cards;