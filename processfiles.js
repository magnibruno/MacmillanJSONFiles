const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Define the base folder path
const baseFolderPath = 'A:\\Projetos\\Magnilearn\\MacmillanJSONFiles\\anaJson';

// Define the target folder for copied files
const targetFolderPath = path.join(baseFolderPath, 'ReadyToImport');

// Ensure the target folder exists
if (!fs.existsSync(targetFolderPath)) {
    fs.mkdirSync(targetFolderPath);
    console.log(`Created folder: ${targetFolderPath}`);
}

// Function to zero-pad numbers to 2 digits
function zeroPad(num) {
    return num.toString().padStart(2, '0');
}

// Function to process the folder structure
function processFolders(baseFolderPath, cefrLevel) {
    fs.readdir(baseFolderPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error('Error reading base folder:', err);
            return;
        }

        entries.forEach(entry => {
            if (entry.isDirectory() && entry.name.toLowerCase().startsWith('unit')) {
                const unitNumber = entry.name.replace(/unit/i, '');
                const unitFolderPath = path.join(baseFolderPath, entry.name);

                fs.readdir(unitFolderPath, { withFileTypes: true }, (err, subEntries) => {
                    if (err) {
                        console.error(`Error reading Unit folder ${entry.name}:`, err);
                        return;
                    }

                    // Check if the structure contains Lesson folders or files directly
                    const hasLessonFolders = subEntries.some(subEntry => subEntry.isDirectory() && subEntry.name.toLowerCase().startsWith('lesson'));

                    if (hasLessonFolders) {
                        // Process Unit/Lesson/Files structure
                        subEntries.forEach(subEntry => {
                            if (subEntry.isDirectory() && subEntry.name.toLowerCase().startsWith('lesson')) {
                                const lessonNumber = subEntry.name.replace(/lesson/i, '');
                                const lessonFolderPath = path.join(unitFolderPath, subEntry.name);

                                fs.readdir(lessonFolderPath, (err, files) => {
                                    if (err) {
                                        console.error(`Error reading Lesson folder ${subEntry.name}:`, err);
                                        return;
                                    }

                                    files.forEach(file => {
                                        if (path.extname(file) === '.json') {
                                            const sourceFilePath = path.join(lessonFolderPath, file);
                                            const targetFileName = `${cefrLevel}${zeroPad(unitNumber)}${zeroPad(lessonNumber)}.json`;
                                            const targetFilePath = path.join(targetFolderPath, targetFileName);

                                            // Copy the file
                                            fs.copyFile(sourceFilePath, targetFilePath, err => {
                                                if (err) {
                                                    console.error(`Error copying file ${file}:`, err);
                                                } else {
                                                    console.log(`Copied file: ${targetFileName}`);
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    } else {
                        // Process Unit/Files structure
                        subEntries.forEach(subEntry => {
                            if (path.extname(subEntry.name) === '.json') {
                                const lessonMatch = subEntry.name.match(/lesson(\d+)/i);
                                if (lessonMatch) {
                                    const lessonNumber = lessonMatch[1];
                                    const sourceFilePath = path.join(unitFolderPath, subEntry.name);
                                    const targetFileName = `${cefrLevel}${zeroPad(unitNumber)}${zeroPad(lessonNumber)}.json`;
                                    const targetFilePath = path.join(targetFolderPath, targetFileName);

                                    // Copy the file
                                    fs.copyFile(sourceFilePath, targetFilePath, err => {
                                        if (err) {
                                            console.error(`Error copying file ${subEntry.name}:`, err);
                                        } else {
                                            console.log(`Copied file: ${targetFileName}`);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    });
}

// Prompt the user for the CEFR level
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the CEFR level (e.g., A1, B2, C1): ', (cefrLevel) => {
    if (!cefrLevel || !/^[A-C][1-2]$/.test(cefrLevel)) {
        console.error('Invalid CEFR level. Please enter a valid level (e.g., A1, B2, C1).');
        rl.close();
        return;
    }

    console.log(`Processing files with CEFR level: ${cefrLevel}`);
    processFolders(baseFolderPath, cefrLevel.toUpperCase());
    rl.close();
});