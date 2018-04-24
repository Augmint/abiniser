'use strict';

const filesLib = require('./files');
const md5 = require('md5');

module.exports = {
    updateDeploymentsFile: (truffleContractFileContent, outputDirectory, abiHash, regenerate, onlyNetworkId = null) => {
        const contractName = truffleContractFileContent.contractName;
        const deploymentsFileName = contractName + '_DEPLOYS.json';
        const generatedAt = new Date().toISOString();

        /**************************************
         * Parse each network in truffle contract file, create <networkId> folder and update deployments file
         **************************************/
        const networks = truffleContractFileContent.networks;
        Object.entries(networks)
            .filter(([network, entry]) => onlyNetworkId === null || network === onlyNetworkId)
            .forEach(([network, entry]) => {
                const deploymentsFilePath = outputDirectory + '/' + network;
                if (!filesLib.directoryExists(deploymentsFilePath)) {
                    try {
                        filesLib.mkDirByPathSync(deploymentsFilePath);
                    } catch (error) {
                        console.error(`\tCan't create deployments output directory ${deploymentsFilePath}:\n${error}`);
                        process.exit(1);
                    }
                    console.log('\tDeployments output director created:', deploymentsFilePath);
                }

                const deploysFile = deploymentsFilePath + '/' + deploymentsFileName;
                let deploys;
                if (!filesLib.fileExists(deploysFile)) {
                    console.log('\tDeployments file doesn\'t exist, creating a new one: ', deploysFile);
                    deploys = { contractName };
                } else {
                    deploys = filesLib.readJsonFile(deploysFile);
                }

                const deploymentInfoExists =
                    deploys[abiHash] && deploys[abiHash].deployments && deploys[abiHash].deployments[entry.address]
                        ? true
                        : false;
                if (deploymentInfoExists && !regenerate) {
                    console.log(
                        `\tContract ${contractName} already on network: ${network} with abi hash: ${abiHash} at address ${
                            entry.address
                        }. --regenerate is not set, skipping.`
                    );
                } else {
                    /**************************************
                     * UPDATE deployments file
                     **************************************/
                    deploys.latestAbiHash = abiHash;
                    if (!deploys[abiHash]) {
                        deploys[abiHash] = { latestDeployedAddress: entry.address, deployments: {} };
                    } else {
                        deploys[abiHash].latestDeployedAddress = entry.address;
                    }

                    if (!deploys[abiHash].deployments[entry.address]) {
                        deploys[abiHash].deployments[entry.address] = {};
                    }

                    const newEntry = {
                        generatedAt,
                        truffleContractFileUpdatedAt: truffleContractFileContent.updatedAt,
                        deployTransactionHash: entry.transactionHash,
                        compiler: truffleContractFileContent.compiler,
                        bytecodeHash: md5(truffleContractFileContent.bytecode),
                        deployedBytecodeHash: md5(truffleContractFileContent.deployedBytecode),
                        sourceHash: md5(truffleContractFileContent.source),
                        source: truffleContractFileContent.source
                    };
                    deploys[abiHash].deployments[entry.address] = newEntry;

                    const deploysFileNewContent = JSON.stringify(deploys, null, '  ');
                    filesLib
                        .writeFile(deploysFile, deploysFileNewContent)
                        .then(() => {
                            console.log(
                                `\t${
                                    deploymentInfoExists ? 'Updated' : 'Created'
                                } deployment info for abi hash ${abiHash} with network id ${network} in: ${deploysFile}`
                            );
                        })
                        .catch(error => {
                            console.error(`Error when saving deployments file: ${deploysFile}\n${error}`);
                        });
                }
            });
    }
};
