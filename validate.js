const Ajv = require('ajv');
const fs = require('fs');
const jsonlint = require('jsonlint');
const path = require('path');

try {
  // Get the schema file path from command-line arguments
  const schemaFilePath = process.argv[2];
  if (!schemaFilePath) {
    console.error('Please provide the schema file path as an argument.');
    process.exit(1);
  }

  // Define the directories
  const sourceDirectory = path.join(__dirname, 'toValidateJSONContent');
  const destinationDirectory = path.join(__dirname, 'validatedJSONContent');

  // Ensure the destination directory exists, if not, create it
  if (!fs.existsSync(destinationDirectory)) {
    fs.mkdirSync(destinationDirectory);
  }

  // Read the files in the source directory
  const files = fs.readdirSync(sourceDirectory);

  // Ensure there is at least one file
  if (files.length === 0) {
    console.error('No files found in the toValidateJSONContent directory.');
    process.exit(1);
  }

  // Pick the first file in the directory
  const filename = path.join(sourceDirectory, files[0]);

  // Load and validate the JSON file using jsonlint
  const data = fs.readFileSync(filename, 'utf8');
  jsonlint.parse(data); // This will throw an error if the JSON is invalid

  // Load the schema
  const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));

  // Initialize Ajv
  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  // Validate the data
  const valid = validate(JSON.parse(data));

  if (valid) {
    console.log('JSON is valid');

    // Create new file name with .valid.json extension
    const newFileName = path.basename(filename, path.extname(filename)) + '.valid.json';
    const destinationPath = path.join(destinationDirectory, newFileName);

    // Move and rename the file
    fs.renameSync(filename, destinationPath);
    console.log(`File moved and renamed to ${destinationPath}`);
  } else {
    console.error('JSON is invalid:', validate.errors);
  }
} catch (error) {
  console.error('Error parsing JSON:', error.message);
}
