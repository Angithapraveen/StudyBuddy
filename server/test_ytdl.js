global.File = class File {};

const ytdl = require('@distube/ytdl-core');
const https = require('https');

async function getXML(url) {
    return new Promise((resolve, reject) => {
       const parsedUrl = new URL(url);
       const req = https.request(parsedUrl, {
           headers: {
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
           }
       }, (res) => {
           let data = '';
           res.on('data', d => data += d);
           res.on('end', () => resolve(data));
       });
       req.on('error', reject);
       req.end();
    });
}

function decodeXML(str) {
      if(!str) return '';
      return str.replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&#x([0-9a-fA-F]+);/gi, (m, g1) => String.fromCharCode(parseInt(g1, 16)))
                .replace(/&#(\d+);/gi, (m, g1) => String.fromCharCode(parseInt(g1, 10)));
}

async function test_ytdl(videoId) {
    try {
        const info = await ytdl.getInfo(videoId);
        const player_response = info.player_response;
        const captions = player_response.captions;
        if (captions && captions.playerCaptionsTracklistRenderer && captions.playerCaptionsTracklistRenderer.captionTracks) {
            console.log('Captions found!', captions.playerCaptionsTracklistRenderer.captionTracks.length);
            const track = captions.playerCaptionsTracklistRenderer.captionTracks[0];
            console.log('Track URL:', track.baseUrl);
            
            const xmlContent = await getXML(track.baseUrl);
            const textRegex = /<text[^>]*>([\s\S]*?)<\/text>/gi;
            let match;
            const transcriptLines = [];

            while ((match = textRegex.exec(xmlContent)) !== null) {
                let line = match[1];
                line = decodeXML(line);
                line = line.replace(/<[^>]+>/g, '');
                line = decodeXML(line);
                transcriptLines.push(line.trim());
            }

            const fullText = transcriptLines.filter(Boolean).join(' ').trim();
            console.log('Transcript length:', fullText.length);
            console.log('Snippet:', fullText.substring(0, 50));
        } else {
            console.log('No captions in player response');
        }
    } catch (e) {
        console.error(e);
    }
}

test_ytdl('aqz-KE-bpKQ');
