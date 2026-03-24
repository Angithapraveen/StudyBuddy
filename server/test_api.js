// Polyfill File for Node 18
global.File = class File {};

const api = require('youtube-transcript-api');
console.log('API loaded!', Object.keys(api));

api.YoutubeTranscript.fetchTranscript('8suHZj1AOr4')
  .then(res => console.log('Success:', res.slice(0, 1)))
  .catch(err => console.error('Error fetching:', err));
