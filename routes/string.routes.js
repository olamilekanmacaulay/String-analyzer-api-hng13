const express = require('express');
const router = express.Router();
const controller = require('../controllers/string.controller');
const { body } = require('express-validator');

// 1. Create/Analyze String
router.post(
  '/',
  [
    // Validate that 'value' exists and is a string
    body('value').isString().withMessage('Invalid data type for "value" (must be string)'),
    body('value').notEmpty().withMessage('Invalid request body or missing "value" field')
  ],
  controller.createString
);

// 3. Get All Strings with Filtering
router.get('/', controller.getAllStringsFiltered);

// 4. Natural Language Filtering
router.get('/filter-by-natural-language', controller.getStringsNatural);

// 2. Get Specific String
router.get('/:value', controller.getString);


// 5. Delete String
router.delete('/:value', controller.deleteString);


module.exports = router;