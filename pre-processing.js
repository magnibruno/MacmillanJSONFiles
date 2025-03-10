const fs = require('fs');
const path = require('path');

// Directory containing the JSON files
const directoryPath = path.join(__dirname, '/objetivesJSON');

// Function to process each JSON file
function processFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  let jsonData;

  try {
    jsonData = JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing JSON in file ${filePath}:`, error.message);
    return;
  }

  // Function to recursively process the JSON object
  function processObject(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'exerciseAnswers' && Array.isArray(obj[key]) && obj[key].length === 1) {
          obj[key] = obj[key][0];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          processObject(obj[key]);
        }

        if (key === 'sectionObjectives' && Array.isArray(obj[key]) && obj[key].length === 1) {
          obj[key] = obj[key][0];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          processObject(obj[key]);
        }
      }
    }
  }

  processObject(jsonData);

  // Write the modified JSON back to the file
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`Processed file: ${filePath}`);
}

// Read all files in the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory:', err);
  }

  // Process each file
  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    if (path.extname(file) === '.json') {
      processFile(filePath);
    }
  });
});