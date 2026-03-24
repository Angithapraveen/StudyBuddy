/**
 * Split long text into fixed-size chunks for sequential processing.
 * @param {string} text
 * @param {number} [size=3000]
 * @returns {string[]}
 */
function splitText(text, size = 3000) {
  if (!text || typeof text !== 'string') return [];
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

module.exports = { splitText };
