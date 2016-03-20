/* global db */
var ONE_DAY = 24 * 60 * 60 * 1000

db.entries.remove({})
db.entries.insert({
  url: 'https://delicious-insights.com/fr/formations/node-js/',
  title: 'Formation Node.js',
  excerpt:
    'Sorti en 2009, Node.js a complètement révolutionné la perception de JavaScript et des infrastructures logicielles côté serveur. Extrêmement performant, agréable à l’emploi, doté d’un écosystème et d’une communauté extrêmement vigoureux, Node.js affiche désormais de nombreux très gros acteurs en production avec des capacités de montée en charge insolentes et beaucoup de success stories.',
  postedAt: new Date(Date.now() - 7 * ONE_DAY),
  tags: ['formation', 'javascript', 'js', 'node'],
  poster: '@porteneuve',
  comments: [
    {
      text: 'Node.js ça roxxe du poney',
      author: '@porteneuve',
      postedAt: new Date(Date.now() - 6 * ONE_DAY),
    },
    {
      text: 'Node, j’adore',
      author: '@charlize',
      postedAt: new Date(Date.now() - 3 * ONE_DAY),
    },
  ],
  score: 1,
  upVoters: ['@porteneuve'],
  downVoters: [],
})
db.entries.insert({
  url: 'https://delicious-insights.com/fr/formations/js-total/',
  title: 'Formation JS Total',
  excerpt:
    'Née à l’automne 2012, la formation JS Total est une combinaison à très, très forte valeur ajoutée.  Sur 4 jours consécutifs, elle permet de découvrir et pratiquer dans un contexte intégré cohérent une foule de compétences et technologies de pointe autour de JavaScript.',
  postedAt: new Date(Date.now() - 7 * ONE_DAY),
  tags: ['formation', 'javascript', 'js', 'react', 'redux', 'webpack'],
  poster: '@porteneuve',
  comments: [
    {
      text: 'I <3 React',
      author: '@porteneuve',
      postedAt: new Date(Date.now() - 7 * ONE_DAY),
    },
  ],
  score: 1,
  upVoters: ['@porteneuve'],
  downVoters: [],
})
db.entries.insert({
  url: 'https://delicious-insights.com/fr/formations/git-total/',
  title: 'Formation Git Total',
  excerpt:
    'La formation Git Total permet à tou·te·s, que vous ayez ou non déjà utilisé Git, voire même de la gestion de versions, de comprendre en profondeur les concepts et le fonctionnement de Git, d’apprivoiser rapidement ses commandes de base mais aussi de nombreuses commandes plus avancées, pour aboutir à un workflow et des bonnes pratiques qui surboostent votre productivité et celle de votre équipe projet !',
  postedAt: new Date(Date.now() - 7 * ONE_DAY),
  tags: [
    'formation',
    'git',
    'github',
    'gitlab',
    'source-control',
    'vcs',
    'workflow',
    'process',
  ],
  poster: '@porteneuve',
  comments: [
    {
      text: 'Git c’est le bien',
      author: '@porteneuve',
      postedAt: new Date(Date.now() - 7 * ONE_DAY),
    },
  ],
  score: 1,
  upVoters: ['@porteneuve'],
  downVoters: [],
})
