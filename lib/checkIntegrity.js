'use strict';

const filesLib = require('./files');

async function checkIntegrity(options) {
    try {
        let config;
        if (filesLib.fileExists(options.configFile)) {
            config = filesLib.readJsonFile(options.configFile);
        }

        const abiOutputDir = options.abiOutputDir || config.abiOutputDir;
        const deploymentsOutputDir = options.deploymentsOutputDir || config.deploymentsOutputDir;

        if (!filesLib.directoryExists(abiOutputDir)) {
            console.error(`Can't find abi output directory ${abiOutputDir}`);
            process.exit(1);
        }

        if (!filesLib.directoryExists(deploymentsOutputDir)) {
            console.error(`Can't find deployments output directory ${deploymentsOutputDir}`);
            process.exit(1);
        }

        const abiFiles = await filesLib.fileWalker(abiOutputDir);

        const abis = [];
        abiFiles.forEach(abiFile => {
            const abiFileContent = filesLib.readJsonFile(abiFile);
            abis.push({
                abiHash: abiFileContent.abiHash,
                contractName: abiFileContent.contractName,
                file: abiFile,
                referenceCount: 0
            });
        });

        const deploymentFiles = await filesLib.fileWalker(deploymentsOutputDir);

        const deploymentsWithoutAbiFile = [];
        deploymentFiles.forEach(file => {
            const content = filesLib.readJsonFile(file);

            for (const abiHash in content.deployedAbis) {
                const abi = abis.find(abi => abi.abiHash === abiHash);
                if (abi) {
                    abi.referenceCount++;
                } else {
                    deploymentsWithoutAbiFile.push({ abiHash, fileName: file });
                }
            }
        });

        console.log(
            '***** ABI files with references from deployment files:\n',
            abis.filter(abi => abi.referenceCount !== 0)
        );
        console.log(
            '***** ABI files WITHOUT reference from deployment files:\n',
            abis.filter(abi => abi.referenceCount === 0)
        );
        console.log('***** Deployments without ABI file:\n', deploymentsWithoutAbiFile);
    } catch (error) {
        console.error('Error:\n', error);
    }
}

module.exports = checkIntegrity;
