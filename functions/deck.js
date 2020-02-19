const main = require('../index');
const { fetchDeck, fetchDoK, rarityFix, getSet, getFlagLang } = require('./fetch');

const deck = (item, params, flags) => {
	const lang = getFlagLang(flags);
		fetchDeck(params)
			.then(decks => {
				let promises = decks.map(async deck=> {
					const cardStats = getCardStats(deck.cards, deck.expansion),
						dokStats = await fetchDoK(deck.id),
						dok = `https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixReddit`,
						official = `https://keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixReddit`,
						decklist = `https://keyforge.skyjedi.com/custom/${deck.id}/${lang}/deck_list`;
					let text = `##${deck.name} • ${getSet(deck.expansion)}\n`;
					text += `- ${deck.houses.map(house => house).join(' • ')}\n`;
					text += `${(deck.wins > 0 || deck.losses > 0) ? `- ${deck.wins}W/${deck.losses}L • Power: ${deck.power_level} • Chains: ${deck.chains}\n` : ''}`;
					text += `- ${Object.keys(cardStats.card_type).map(type => `${type}: ${cardStats.card_type[type]}`).join(' • ')}\n`;
					text += `- ${['Special', 'Rare', 'Uncommon', 'Common'].map(type => {
						if(cardStats.rarity[type]) return `${type}: ${cardStats.rarity[type]}`;
					}).filter(Boolean).join(' • ')}\n`;
					if (cardStats.is_maverick > 0 || cardStats.is_anomaly > 0 || cardStats.legacy > 0) {
						text += '- ';
						text += `${cardStats.is_maverick > 0 ? `Mavericks: ${cardStats.is_maverick}` : ''}`;
						text += cardStats.is_maverick > 0 && cardStats.is_anomaly > 0 ? ' • ' : '';
						text += `${cardStats.is_anomaly > 0 ? `Anomaly: ${cardStats.is_anomaly}` : ''}`;
						text += (cardStats.is_maverick > 0 || cardStats.is_anomaly > 0) && cardStats.legacy > 0 ? ' • ' : '';
						text += `${cardStats.legacy > 0 ? `Legacy: ${cardStats.legacy}` : ''}`;
						text += '\n'
					}
					text += `- ${dokStats.sas} • ${dokStats.sasStar}\n- ${dokStats.deckAERC}\n`;
					text += `- [Official](${official}) • [DoK](${dok}) • [Decklist](${decklist})`;
					return text;
				});
				Promise.all(promises).then(final => {
					main.sendMessage(item, final.join('\n'));
				});
			}).catch(console.error);
};

const getCardStats = (cards, expansion) => {
	return {
		card_type: cards.reduce((acc, card) => ({ ...acc, [card.card_type]: acc[card.card_type] + 1 }),
			{ Action: 0, Artifact: 0, Creature: 0, Upgrade: 0 },
		),
		rarity: cards.reduce((acc, card) =>
			({
				...acc,
				[rarityFix(card.rarity)]: acc[rarityFix(card.rarity)] ? acc[rarityFix(card.rarity)] + 1 : 1,
			}), {}),
		is_maverick: cards.filter(card => card.is_maverick).length,
		is_anomaly: cards.filter(card => card.is_anomaly).length,
		legacy: cards.filter(card => !(card.expansion === expansion)).length,
	};
};

exports.deck = deck;