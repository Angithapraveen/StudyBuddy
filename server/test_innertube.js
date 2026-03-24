const https = require('https');

function safeJSONParse(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
}

async function fetchInnerTube(videoId) {
  return new Promise((resolve, reject) => {
     const reqConfig = {
      hostname: 'www.youtube.com',
      path: '/youtubei/v1/player?prettyPrint=false',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/17.31.35 (Linux; U; Android 14)'
      }
    };

    const body = JSON.stringify({
        context: {
           client: {
              clientName: 'ANDROID',
              clientVersion: '17.31.35'
           }
        },
        videoId: videoId
    });

    const req = https.request(reqConfig, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(safeJSONParse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

fetchInnerTube('8suHZj1AOr4').then(res => {
    console.log(Object.keys(res || {}));
    if (res && res.captions) {
        console.log('Captions found! Tracks:', res.captions.playerCaptionsTracklistRenderer.captionTracks.length);
    } else {
        console.log('No captions! Playability:', res?.playabilityStatus);
    }
});
