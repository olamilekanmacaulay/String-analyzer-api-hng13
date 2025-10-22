const { validationResult } = require('express-validator');
const StringAnalysis = require('../models/stringAnalysis.model');
const { analyzeString } = require('../utils/stringAnalyzer');

// Helper function to format the DB record to the API response
const formatResponse = (dbRecord) => {
  return {
    id: dbRecord.sha256_hash, 
    value: dbRecord.value,
    properties: {
      length: dbRecord.length,
      is_palindrome: dbRecord.is_palindrome,
      unique_characters: dbRecord.unique_characters,
      word_count: dbRecord.word_count,
      sha256_hash: dbRecord.sha256_hash,
      character_frequency_map: dbRecord.character_frequency_map,
    },
    created_at: dbRecord.createdAt.toISOString(),
  };
};

// 1. POST /strings
exports.createString = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (errors.array()[0].msg.includes('missing "value"')) {
      return res.status(400).send({ error: errors.array()[0].msg });
    }
    return res.status(422).send({ error: errors.array()[0].msg });
  }

  const { value } = req.body;

  try {
    const existing = await StringAnalysis.findOne({ value });
    if (existing) {
      return res.status(409).send({ error: 'Conflict: String already exists in the system' });
    }

    const properties = analyzeString(value);
    
    // Convert JS object to Map for Mongoose schema
    properties.character_frequency_map = new Map(Object.entries(properties.character_frequency_map));

    const newRecord = new StringAnalysis({
      value,
      ...properties,
    });

    await newRecord.save();
    return res.status(201).send(formatResponse(newRecord));

  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

// 2. GET /strings/{string_value}
exports.getString = async (req, res) => {
  try {
    const value = decodeURIComponent(req.params.value);
    const record = await StringAnalysis.findOne({ value });

    if (!record) {
      return res.status(404).send({ error: 'String does not exist in the system' });
    }
    return res.status(200).send(formatResponse(record));
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

// 3. GET /strings (Filtered)
exports.getAllStringsFiltered = async (req, res) => {
  try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
    const filter = {};
    const filters_applied = {};

    // Build the filter object for the Mongoose query
    if (is_palindrome) {
      filter.is_palindrome = is_palindrome === 'true';
      filters_applied.is_palindrome = filter.is_palindrome;
    }

    if (min_length) {
      filter.length = { ...filter.length, $gte: parseInt(min_length) };
      filters_applied.min_length = parseInt(min_length);
    }

    if (max_length) {
      filter.length = { ...filter.length, $lte: parseInt(max_length) };
      filters_applied.max_length = parseInt(max_length);
    }

    if (word_count) {
      filter.word_count = parseInt(word_count);
      filters_applied.word_count = parseInt(word_count);
    }
    
    if (contains_character) {
        filter.value = { $regex: contains_character, $options: 'i' };
        filters_applied.contains_character = contains_character;
    }

    const records = await StringAnalysis.find(filter);
    const formattedData = records.map(formatResponse);

    return res.status(200).json({
      data: formattedData,
      count: records.length,
      filters_applied,
    });

  } catch (err) {
    return res.status(400).send({ error: 'Invalid query parameter values or types' });
  }
};

// 4. GET /strings/filter-by-natural-language
exports.getStringsNatural = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send({ error: 'Unable to parse natural language query' });
  }

  const lowerCaseQuery = query.toLowerCase();
  const filter = {};
  const interpreted_query = { original: query, parsed_filters: {} };

  try {
    // Parse keywords and build filter object

    // is_palindrome
    if (lowerCaseQuery.includes('palindromic') || lowerCaseQuery.includes('palindrome')) {
      filter.is_palindrome = true;
      interpreted_query.parsed_filters.is_palindrome = true;
    }

    // word_count
    if (lowerCaseQuery.includes('single word') || lowerCaseQuery.includes('one word')) {
      filter.word_count = 1;
      interpreted_query.parsed_filters.word_count = 1;
    } else {
      const wordCountMatch = lowerCaseQuery.match(/(\d+)\s+words?/);
      if (wordCountMatch) {
        filter.word_count = parseInt(wordCountMatch[1]);
        interpreted_query.parsed_filters.word_count = filter.word_count;
      }
    }

    // length (min/max)
    const longerThanMatch = lowerCaseQuery.match(/longer than (\d+)/);
    if (longerThanMatch) {
      filter.length = { ...filter.length, $gt: parseInt(longerThanMatch[1]) };
      interpreted_query.parsed_filters.min_length = parseInt(longerThanMatch[1]) + 1;
    }

    const shorterThanMatch = lowerCaseQuery.match(/shorter than (\d+)/);
    if (shorterThanMatch) {
      filter.length = { ...filter.length, $lt: parseInt(shorterThanMatch[1]) };
      interpreted_query.parsed_filters.max_length = parseInt(shorterThanMatch[1]) - 1;
    }

    // contains_character
    const containsMatch = lowerCaseQuery.match(/contain(?:s|ing) the letter "(.+?)"/);
    if (containsMatch) {
      filter.value = { $regex: containsMatch[1], $options: 'i' };
      interpreted_query.parsed_filters.contains_character = containsMatch[1];
    }
    
    // --- Check for conflicting queries ---
    if (filter.length && filter.length.$gt && filter.length.$lt && filter.length.$gt >= filter.length.$lt) {
        return res.status(422).send({ error: 'Query parsed but resulted in conflicting filters (e.g., "longer than 10 and shorter than 5")'});
    }

    const records = await StringAnalysis.find(filter);
    const formattedData = records.map(formatResponse);

    return res.status(200).json({
      data: formattedData,
      count: records.length,
      interpreted_query,
    });

  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

// 5. DELETE /strings/{string_value}
exports.deleteString = async (req, res) => {
    try {
        const value = decodeURIComponent(req.params.value);
        const result = await StringAnalysis.deleteOne({ value });

        if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'String does not exist in the system' });
        }

        return res.status(204).send();

    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
};

