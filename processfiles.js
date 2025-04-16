const fs = require('fs');
const path = require('path');

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
function processFolders(baseFolderPath) {
    fs.readdir(baseFolderPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error('Error reading base folder:', err);
            return;
        }

        entries.forEach(entry => {
            console.log(`Processing entry: ${entry.name}`);
                const unitNumber = entry.name.replace('unit', '');
                console.log(`unitNumber entry: ${unitNumber}`);
                const unitFolderPath = path.join(baseFolderPath, entry.name);
                console.log(`unitFolderPath entry: ${unitFolderPath}`);
                fs.readdir(unitFolderPath, { withFileTypes: true }, (err, lessonEntries) => {
                    if (err) {
                        console.error(`Error reading Unit folder ${entry.name}:`, err);
                        return;
                    }
                    console.log(`lessonEntries: ${lessonEntries}`);
                    lessonEntries.forEach(lessonEntry => {
                            const lessonNumber = lessonEntry.name.replace('lesson', '');
                            const lessonFolderPath = path.join(unitFolderPath, lessonEntry.name);

                            fs.readdir(lessonFolderPath, (err, files) => {
                                if (err) {
                                    console.error(`Error reading Lesson folder ${lessonEntry.name}:`, err);
                                    return;
                                }

                                files.forEach(file => {
                                    if (path.extname(file) === '.json') {
                                        const sourceFilePath = path.join(lessonFolderPath, file);
                                        console.log('unitNumber', unitNumber);
                                        const targetFileName = `B2${zeroPad(unitNumber,1)}${zeroPad(lessonNumber,1)}.json`;
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
                        
                    });
                });            
        });
    });
}

// Run the script
processFolders(baseFolderPath);