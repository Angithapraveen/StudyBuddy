const https = require('https');

async function testExtracting() {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/watch?v=8suHZj1AOr4', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        // Try to match standard tracks array
        const re = /"captionTracks":\[(.*?)\]/;
        const m = d.match(re);
        if (m) {
          console.log('Found tracks! length:', m[0].length);
          console.log('Snippet:', m[0].substring(0, 300));
        } else {
          console.log('No captionTracks found in HTML payload!');
          // let's look for "captions" or "playerCaptionsTracklistRenderer"
          if (d.includes('playerCaptionsTracklistRenderer')) {
            console.log('Renderer exists but regex failed. Index:', d.indexOf('playerCaptionsTracklistRenderer'));
          } else {
            console.log('Completely missing captions info.');
            if (d.includes('g-recaptcha')) console.log('CAPTCHA BLOCKED');
          }
        }
        resolve();
      });
    });
  });
}

testExtracting();
