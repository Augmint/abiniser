'use strict';

const filesLib = require('./files');

async function removeSourceEntries(options) {
    try {
        let config;
        if (filesLib.fileExists(options.configFile)) {
            config = filesLib.readJsonFile(options.configFile);
        }

        const deploymentsOutputDir = options.deploymentsOutputDir || config.deploymentsOutputDir;

        if (!filesLib.directoryExists(deploymentsOutputDir)) {
            console.error(`Can't find deployments output directory ${deploymentsOutputDir}`);
            process.exit(1);
        }

        const deploymentFiles = await filesLib.fileWalker(deploymentsOutputDir);

        deploymentFiles.forEach(file => {
            const content = filesLib.readJsonFile(file);
            let changeCount = 0;
            for (const abiHash in content.deployedAbis) {
                for (const address in content.deployedAbis[abiHash].deployments) {
                    if (content.deployedAbis[abiHash].deployments[address].source) {
                        console.debug('removed source entry for', address, ' in', file);
                        delete content.deployedAbis[abiHash].deployments[address].source;
                        changeCount++;
                    } else {
                        //console.debug('no source entry for', address, ' in:', address);
                    }
                }
            }
            if (changeCount > 0) {
                filesLib
                    .writeFile(file, JSON.stringify(content, null, '  '))
                    .then(() => {
                        console.log(`${file} updated. Removed source entry from ${changeCount} deployments.`);
                    })
                    .catch(error => {
                        console.error(`Error when saving deployments file: ${file}\n${error}`);
                    });
            } else {
                console.log(file, ' had no source entries');
            }
        });
    } catch (error) {
        console.error('Error:\n', error);
    }
}

module.exports = removeSourceEntries;
