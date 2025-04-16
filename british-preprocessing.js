const fs = require('fs');
const path = require('path');

// Directory containing the JSON files
const directoryPath = './anaJson'; // Adjust the path if needed

// Recursive function to update all occurrences of the "GKU" key, modify "chapter" to "chapters", update "dialect", change "exerciseType", and handle "exerciseAnswers"
function updateJSON(obj) {
    for (const key in obj) {
        if (key === 'GKU') {
            // Update GKU with "GB_" prefix
            if (!obj[key].startsWith('GB_')) {
                obj[key] = `GB_${obj[key]}`;
            }
        } else if (key === 'chapter' && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            // Process the contents of the "chapter" object first
            updateJSON(obj[key]);

            // Rename "chapter" to "chapters" and convert to an array
            obj['chapters'] = [obj[key]];
            delete obj['chapter'];
        } else if (key === 'exerciseType' && obj[key] === 'word bank') {
            // Update exerciseType from "word bank" to "RC - word bank"
            obj[key] = 'RC - word bank';
        } else if (key === 'exerciseAnswers' && Array.isArray(obj[key])) {
            // Convert "exerciseAnswers" from an array of strings to a single string
            obj[key] = obj[key].join(', ');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recurse into nested objects or arrays
            updateJSON(obj[key]);
        }
    }
}

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(directoryPath, file);
            console.log(`Processing file: ${file}`);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return;
                }

                try {
                    let jsonContent = JSON.parse(data);

                    // Update the root-level "dialect" property
                    if (jsonContent.hasOwnProperty('dialect') && typeof jsonContent['dialect'] === 'string') {
                        jsonContent['dialect'] = 'British';
                    }

                    updateJSON(jsonContent); // Apply all updates recursively

                    fs.writeFile(filePath, JSON.stringify(jsonContent, null, 2), 'utf8', err => {
                        if (err) {
                            console.error(`Error writing file ${file}:`, err);
                        } else {
                            console.log(`Updated file: ${file}`);
                        }
                    });
                } catch (parseErr) {
                    console.error(`Error parsing JSON in file ${file}:`, parseErr);
                }
            });
        }
    });
});