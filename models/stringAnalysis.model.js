const mongoose = require('mongoose');

const StringAnalysisSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  length: {
    type: Number,
    required: true,
  },
  is_palindrome: {
    type: Boolean,
    required: true,
  },
  word_count: {
    type: Number,
    required: true,
  },
  unique_characters: {
    type: Number,
    required: true,
  },
  sha256_hash: {
    type: String,
    required: true,
  },
  character_frequency_map: {
    type: Map,
    of: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StringAnalysis', StringAnalysisSchema);