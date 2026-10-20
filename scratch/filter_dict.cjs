const fs = require('fs');

const dict = JSON.parse(fs.readFileSync('scratch/catalog_dict.json', 'utf8'));

// Filter X
dict.X.lots = [
  dict.X.lots.flat().filter(item => {
    const w = item.word.toUpperCase();
    return !['XALE', 'XADREZ', 'XERIFE', 'XILOFONE', 'XODÓ', 'XODO'].includes(w);
  })
];

// Filter Y
dict.Y.lots = [
  dict.Y.lots.flat().filter(item => {
    const w = item.word.toUpperCase();
    return !['YAKULT', 'YOUTUBE', 'YORKSHIRE', 'YEN', 'YOGURT', 'KARAOKÊ'].includes(w);
  })
];

// Filter Z
const zRemaining = dict.Z.lots.flat().filter(item => {
  const w = item.word.toUpperCase();
  return !['ZABUMBA', 'ZABUMBO'].includes(w);
});
dict.Z.lots = [
  zRemaining.slice(0, 4),
  zRemaining.slice(4)
];

console.log('X remaining:', dict.X.lots[0].map(x => x.word));
console.log('Y remaining:', dict.Y.lots[0].map(x => x.word));
console.log('Z remaining:', dict.Z.lots.map(l => l.map(x => x.word)));

fs.writeFileSync('scratch/catalog_dict.json', JSON.stringify(dict, null, 2));
console.log('Updated scratch/catalog_dict.json successfully');
