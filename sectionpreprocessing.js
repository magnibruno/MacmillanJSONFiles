const fs = require('fs');
const path = require('path');

// Define the folder path
const folderPath = 'A:\\Projetos\\Magnilearn\\MacmillanJSONFiles\\anaJson';

// Define the fields to add
const additionalFields = {
    dialect: "American",
    CEFRLevel: "B2"
};

// Function to process JSON files recursively
function processFilesRecursively(folderPath) {
    fs.readdir(folderPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error('Error reading the folder:', err);
            return;
        }

        entries.forEach(entry => {
            const entryPath = path.join(folderPath, entry.name);

            if (entry.isDirectory()) {
                // If the entry is a directory, recursively process it
                processFilesRecursively(entryPath);
            } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.json') {
                // If the entry is a JSON file, process it
                fs.readFile(entryPath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Error reading file ${entry.name}:`, err);
                        return;
                    }

                    try {
                        // Parse the JSON data
                        let jsonData = JSON.parse(data);

                        // Add the additional fields
                        Object.assign(jsonData, additionalFields);

                        // Rename "exerciseAnswer" to "exerciseAnswers"
                        jsonData = renameField(jsonData, "exerciseAnswer", "exerciseAnswers");

                        // Write the updated JSON back to the file
                        fs.writeFile(entryPath, JSON.stringify(jsonData, null, 4), 'utf8', (err) => {
                            if (err) {
                                console.error(`Error writing file ${entry.name}:`, err);
                            } else {
                                console.log(`Updated file: ${entry.name}`);
                            }
                        });
                    } catch (parseErr) {
                        console.error(`Error parsing JSON in file ${entry.name}:`, parseErr);
                    }
                });
            }
        });
    });
}

// Function to rename a field in a JSON object
function renameField(obj, oldKey, newKey) {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => renameField(item, oldKey, newKey));
    }

    const updatedObj = {};
    for (const key in obj) {
        if (key === oldKey) {
            updatedObj[newKey] = renameField(obj[key], oldKey, newKey);
        } else {
            updatedObj[key] = renameField(obj[key], oldKey, newKey);
        }
    }
    return updatedObj;
}

// Run the script
processFilesRecursively(folderPath);