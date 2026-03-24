const { getSubtitles } = require('youtube-captions-scraper');

async function test() {
    try {
        console.log('Testing YouTube Captions Scraper...');
        const videoId = 'aqz-KE-bpKQ'; // MKBHD or similar tech video usually has captions
        const captions = await getSubtitles({
          videoID: videoId,
          lang: 'en' // default: `en`
        });
        const text = captions.map(c => c.text).join(' ');
        console.log('Success (first 100 chars):', text.substring(0, 100));
    } catch (err) {
        console.error('FAILED:', err.message);
    }
}

test();
