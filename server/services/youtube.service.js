/**
 * YouTube video ID from watch or youtu.be URLs.
 * Supports https://www.youtube.com/watch?v=VIDEO_ID and https://youtu.be/VIDEO_ID
 */
function getVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
  if (!match) return null;
  const raw = match[1];
  const base = raw.split(/[?#]/)[0].trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(base)) return base;
  const short = base.match(/^([a-zA-Z0-9_-]{11})/);
  return short ? short[1] : null;
}

function httpError(message, statusCode = 400) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

class YouTubeService {
  static getVideoId = getVideoId;

  /** @deprecated use getVideoId */
  static extractVideoId(url) {
    return getVideoId(url);
  }

  /**
   * Load ESM build (package "main" is incompatible with require() in Node).
   */
  static async loadTranscriptModule() {
    return import('youtube-transcript/dist/youtube-transcript.esm.js');
  }

  /**
   * Map library errors to HTTP-friendly errors; generic failures stay generic.
   */
  static mapTranscriptLibraryError(err) {
    const name = err?.name || '';
    const msg = typeof err?.message === 'string' ? err.message : '';

    if (name === 'YoutubeTranscriptDisabledError') {
      return httpError('Captions are disabled for this video.', 422);
    }
    if (name === 'YoutubeTranscriptNotAvailableError') {
      return httpError('No transcript is available for this video.', 422);
    }
    if (name === 'YoutubeTranscriptVideoUnavailableError') {
      return httpError('This video is no longer available.', 404);
    }
    if (name === 'YoutubeTranscriptTooManyRequestError') {
      return httpError('Too many requests to YouTube. Try again later.', 429);
    }
    if (name === 'YoutubeTranscriptNotAvailableLanguageError') {
      return null;
    }

    if (msg.includes('captcha')) {
      return httpError('YouTube requires verification. Try again later.', 429);
    }

    console.error('[YouTubeService] Unmapped transcript error:', name, msg);
    return httpError('Failed to fetch transcript.', 502);
  }

  /**
   * Fetch transcript using YoutubeTranscript.fetchTranscript(videoId).
   * @returns {{ videoId: string, transcript: string }}
   */
  static async fetchTranscriptForApi(url) {
    if (!url || typeof url !== 'string') {
      throw httpError('Invalid YouTube URL', 400);
    }

    const videoId = getVideoId(url);
    console.log('[YouTubeService] requestUrl:', url, 'videoId:', videoId);

    if (!videoId) {
      throw httpError('Invalid YouTube URL', 400);
    }

    const { YoutubeTranscript } = await this.loadTranscriptModule();

    let segments;
    try {
      try {
        segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      } catch (err) {
        const mapped = this.mapTranscriptLibraryError(err);
        if (mapped) throw mapped;
        segments = await YoutubeTranscript.fetchTranscript(videoId);
      }
    } catch (err) {
      if (err.statusCode) throw err;
      const mapped = this.mapTranscriptLibraryError(err);
      if (mapped) throw mapped;
      throw err;
    }

    console.log(
      '[YouTubeService] transcript segments:',
      Array.isArray(segments) ? segments.length : 0
    );

    const transcript = segments
      .map((s) => s.text)
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!transcript.length) {
      throw httpError('Failed to fetch transcript.', 502);
    }

    console.log('[YouTubeService] transcript char length:', transcript.length);
    return { videoId, transcript };
  }

  /** Used by POST /process/youtube when transcript is not supplied by the client. */
  static async getTranscript(url) {
    const { transcript } = await this.fetchTranscriptForApi(url);
    return transcript;
  }
}

module.exports = YouTubeService;
