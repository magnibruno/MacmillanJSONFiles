const Ajv = require('ajv');
const fs = require('fs');
const jsonlint = require('jsonlint');

try {

  // Get the filename from the command line arguments
  const filename = process.argv[2];

  if (!filename) {
    console.error('Please provide a JSON file to validate.');
    process.exit(1);
  }

  // Load and validate the JSON file using jsonlint
  const data = fs.readFileSync(filename, 'utf8');
  jsonlint.parse(data); // This will throw an error if the JSON is invalid

  // Load the schema
  const schema = JSON.parse(fs.readFileSync('.schema.json', 'utf8'));

  // Initialize Ajv
  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  // Validate the data
  const valid = validate(JSON.parse(data));

  if (valid) {
    console.log('JSON is valid');
  } else {
    console.error('JSON is invalid:', validate.errors);
  }
} catch (error) {
  console.error('Error parsing JSON:', error.message);
}