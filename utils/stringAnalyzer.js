const crypto = require('crypto');

function analyzeString(str) {
  // 1. is_palindrome
  const lowerCaseStr = str.toLowerCase();
  const reversedStr = lowerCaseStr.split('').reverse().join('');
  const is_palindrome = lowerCaseStr === reversedStr;

  // 2. length
  const length = str.length;

  // 3. word_count
  const word_count = str.trim().split(/\s+/).filter(Boolean).length;

  // 4. unique_characters
  const unique_characters = new Set(str).size;

  // 5. sha256_hash
  const sha256_hash = crypto.createHash('sha256').update(str).digest('hex');

  // 6. character_frequency_map
  const character_frequency_map = {};
  for (const char of str) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

module.exports = { analyzeString };