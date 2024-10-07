const fs = require('fs');

// Load the JSON file
const data = fs.readFileSync('A1Unit1Reading.json', 'utf8');

// Position to find
const position = 559;

// Find the character at the specified position
const charAtPosition = data[position - 1]; // -1 because positions are 0-based in JavaScript

// Find the line and column number
const lines = data.substring(0, position).split('\n');
const lineNumber = lines.length;
const columnNumber = lines[lines.length - 1].length;

console.log(`Character at position ${position}: ${charAtPosition}`);
console.log(`Line number: ${lineNumber}, Column number: ${columnNumber}`);

// Parse the JSON data
let jsonData;
try {
  jsonData = JSON.parse(data);
} catch (error) {
  console.error('Error parsing JSON:', error.message);
  process.exit(1);
}

// Function to find the field and property at a specific position
function findFieldAndProperty(json, pos, currentPath = '') {
  if (typeof json !== 'object' || json === null) return null;

  for (const key in json) {
    const value = json[key];
    const keyPath = currentPath ? `${currentPath}.${key}` : key;
    const keyPosition = data.indexOf(`"${key}"`);

    if (keyPosition <= pos && pos < keyPosition + key.length + 2) {
      return { field: key, property: value, path: keyPath };
    }

    if (typeof value === 'object') {
      const result = findFieldAndProperty(value, pos, keyPath);
      if (result) return result;
    }
  }
  return null;
}

const result = findFieldAndProperty(jsonData, position);
if (result) {
  console.log(`Field: ${result.field}`);
  console.log(`Property: ${JSON.stringify(result.property, null, 2)}`);
  console.log(`Path: ${result.path}`);
} else {
  console.log('No field or property found at the specified position.');
}