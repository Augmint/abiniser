'use strict';

const filesLib = require('./files');
const md5 = require('md5');

module.exports = {
    updateDeploymentsFile: (truffleContractFileContent, outputDirectory, abiHash) => {
        const contractName = truffleContractFileContent.contractName;
        const deploymentsFile = outputDirectory + '/' + contractName + '_DEPLOYS_' + abiHash + '.json';
        const generatedAt = new Date().toISOString();
        const compiler = truffleContractFileContent.compiler;
        const source = truffleContractFileContent.source;
        const sourceHash = md5(source);
        const byteCodeHash = md5(truffleContractFileContent.bytecode);
        let entriesChanged = 0;

        let deployments;
        if (!filesLib.fileExists(deploymentsFile)) {
            console.log('\tdeployments file doesn\'t exist, creating a new one: ', deploymentsFile);
            deployments = { contractName, abiHash, networks: {} };
        } else {
            deployments = filesLib.readJsonFile(deploymentsFile);
        }

        /**************************************
         * Parse each network in truffle contract file and update deployments
         **************************************/
        const networks = truffleContractFileContent.networks;
        Object.entries(networks).forEach(([network, entry]) => {
            let skipEntry = false;
            if (!deployments.networks) {
                deployments.networks = { network: {} };
            } else if (!deployments.networks[network]) {
                deployments.networks[network] = {};
            } else if (deployments.networks[network].latest) {
                if (deployments.networks[network].latest.address === entry.address) {
                    console.log(
                        `\tContract ${contractName} already on network: ${network} at address ${
                            entry.address
                        }. Skipping.`
                    );
                    skipEntry = true;
                } else {
                    // move latest entry to legacy []
                    if (!deployments.networks[network].legacy) {
                        deployments.networks[network].legacy = [];
                    }
                    deployments.networks[network].legacy.push(deployments.networks[network].latest);
                }
            }

            if (!skipEntry) {
                entriesChanged++;
                const newEntry = {
                    address: entry.address,
                    generatedAt,
                    deployTransactionHash: entry.transactionHash,
                    compiler,
                    byteCodeHash,
                    sourceHash,
                    source
                };
                deployments.networks[network].latest = newEntry;
            }
        });

        /**************************************
         * UPDATE deployments file
         **************************************/
        if (entriesChanged > 0) {
            const deploymentsFileContent = JSON.stringify(deployments, null, '  ');

            filesLib
                .writeFile(deploymentsFile, deploymentsFileContent)
                .then(() => {
                    console.log(`${entriesChanged} entries updated in deployments file: ${deploymentsFile}`);
                })
                .catch(error => {
                    console.error(`Error when saving deployents file: ${deploymentsFile}\n${error}`);
                });
        }
    }
};
