const YouTubeService = require('./services/youtube.service.js');

async function test() {
    try {
        console.log('Testing YouTube Service...');
        const url = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'; // Simple yt video
        const transcript = await YouTubeService.getTranscript(url);
        console.log('Transcript Success (first 50 chars):', transcript.substring(0, 50));
    } catch (error) {
        console.error('TEST FAILED');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
    }
}

test();
