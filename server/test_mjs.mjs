import pkg from 'youtube-transcript';
const { YoutubeTranscript } = pkg;

async function test_mjs() {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript('8suHZj1AOr4');
        const text = transcript.map(t => t.text).join(' ');
        console.log('SUCCESS_MJS_TRANSCRIPT: ' + text.substring(0, 100));
    } catch (e) {
        console.error('ERROR_MJS_TRANSCRIPT:', e);
    }
}

test_mjs();
