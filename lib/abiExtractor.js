'use strict';

const md5 = require('md5');
const stableStringify = require('json-stable-stringify');
const filesLib = require('./files');

module.exports = {
    generateAbiFile: (truffleContractFileContent, outputDir, regenerate) => {
        const contractName = truffleContractFileContent.contractName;
        const generatedAt = new Date().toISOString();
        const abiHash = md5(stableStringify(truffleContractFileContent.abi));

        const abiFileName = contractName + '_ABI_' + abiHash + '.json';
        const outputFile = outputDir + '/' + abiFileName;
        const abiFileExists = filesLib.fileExists(outputFile);
        if (abiFileExists && !regenerate) {
            console.log('\tAbi file', outputFile, 'already exists and regenerate option (-r) is not set. Skipping.');
        } else {
            const abiFileOutput = {
                contractName,
                abiHash,
                generatedAt,
                abi: truffleContractFileContent.abi
            };

            const abiFileContent = JSON.stringify(abiFileOutput, null, '  ');

            filesLib
                .writeFile(outputFile, abiFileContent)
                .then(() => {
                    console.log(`Abi file ${abiFileExists ? 'regenerated:' : 'generated:'} ${outputFile}`);
                })
                .catch(error => {
                    console.error(`Error when saving Abi file: ${outputFile}\n${error}`);
                });
        }
        return abiHash;
    }
};
