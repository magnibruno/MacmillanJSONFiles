const fs = require('fs');
const path = require('path');
console.log('Starting audio file processing...');

// Define paths
const readyToImportPath = 'A:\\Projetos\\Magnilearn\\MacmillanJSONFiles\\anaJson\\ReadyToImport';
const audioSourcePath = 'A:\\Downloads\\AmericanBooks\\Level 4\\audio';
const audioTargetPath = 'A:\\Projetos\\Magnilearn\\MacmillanJSONFiles\\audios';

// Ensure the target folder exists
if (!fs.existsSync(audioTargetPath)) {
    fs.mkdirSync(audioTargetPath);
    console.log(`Created folder: ${audioTargetPath}`);
}

// Function to process JSON files
function processAudioFiles() {
    fs.readdir(readyToImportPath, (err, files) => {
        if (err) {
            console.error('Error reading ReadyToImport folder:', err);
            return;
        }
        console.log(`Found ${files.length} files in ReadyToImport folder.`);

        files.forEach(file => {
            if (path.extname(file) === '.json') {
                const filePath = path.join(readyToImportPath, file);

                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Error reading file ${file}:`, err);
                        return;
                    }

                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`Processing file: ${file}`);

                        // Find all "setAudio" fields in the JSON object
                        const audioFiles = findSetAudioFields(jsonData);

                        audioFiles.forEach(audioFileName => {
                            console.log(`Found setAudio: ${audioFileName}`);

                            // Copy the audio file
                            const sourceAudioFile = findAudioFile(audioSourcePath, audioFileName);
                            if (sourceAudioFile) {
                                const targetAudioFile = path.join(audioTargetPath, path.basename(sourceAudioFile));
                                fs.copyFile(sourceAudioFile, targetAudioFile, err => {
                                    if (err) {
                                        console.error(`Error copying audio file ${audioFileName}:`, err);
                                    } else {
                                        console.log(`Copied audio file: ${audioFileName}`);
                                    }
                                });
                            } else {
                                console.warn(`Audio file not found for: ${audioFileName}`);
                            }
                        });
                    } catch (parseErr) {
                        console.error(`Error parsing JSON in file ${file}:`, parseErr);
                    }
                });
            }
        });
    });
}

// Function to recursively find all "setAudio" fields in a JSON object
function findSetAudioFields(obj) {
    let audioFiles = [];

    if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            if (key === 'setAudio' && obj[key] && obj[key].trim() !== '') {
                audioFiles.push(obj[key].trim());
            } else if (typeof obj[key] === 'object') {
                audioFiles = audioFiles.concat(findSetAudioFields(obj[key]));
            }
        }
    }

    return audioFiles;
}

// Function to find an audio file by name (ignoring extension)
function findAudioFile(directory, fileNameWithoutExtension) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (path.parse(file).name === fileNameWithoutExtension) {
            return path.join(directory, file);
        }
    }
    return null;
}

// Run the script
processAudioFiles();