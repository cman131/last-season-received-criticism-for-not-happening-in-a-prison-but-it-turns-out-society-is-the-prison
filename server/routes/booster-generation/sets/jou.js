const list_of_JOU_gods = 
[
'Heliod, God of the Sun','Thassa, God of the Sea','Erebos, God of the Dead','Purphoros, God of the Forge', 'Nylea, God of the Hunt', 
'Athreos, God of Passage','Ephara, God of the Polis','Iroas, God of Victory','Karametra, God of Harvests','Keranos, God of Storms',
'Kruphix, God of Horizons','Mogis, God of Slaughter','Pharika, God of Affliction','Phenax, God of Deception','Xenagos, God of Revels',
];

function getRandomIndex(length = 0) {
    return Math.floor(Math.random() * length);
 }

function generatePacks(cards, count, lands, mapCard){
    const booster = list_of_JOU_gods;
    booster.push(lands[getRandomIndex(lands.length)])
    return list_of_JOU_gods;
}

exports.generatePacks = generatePacks; 