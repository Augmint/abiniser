'use strict';

const filesLib = require('./files');
const md5 = require('md5');

module.exports = {
    updateDeploymentsFile: (truffleContractFileContent, outputDirectory, abiHash, regenerate, onlyNetworkId = null) => {
        const contractName = truffleContractFileContent.contractName;
        const deploymentsFileName = contractName + '_DEPLOYS.json';
        const generatedAt = new Date().toISOString();
        const bytecodeHash = md5(truffleContractFileContent.bytecode);
        const deployedBytecodeHash = md5(truffleContractFileContent.deployedBytecode);
        const sourceHash = md5(truffleContractFileContent.source);

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

                const deploymentAddressExists =
                    deploys.deployedAbis &&
                    deploys.deployedAbis[abiHash] &&
                    deploys.deployedAbis[abiHash].deployments &&
                    deploys.deployedAbis[abiHash].deployments[entry.address];

                // handle special case for ganache or private network deploys where the same address possible with different code
                //    in this case we will update the deployment info even if regenerate is not set
                let infoChangedForDeployedAddress = false;
                if (deploymentAddressExists) {
                    const existingEntry = deploys.deployedAbis[abiHash].deployments[entry.address];

                    infoChangedForDeployedAddress =
                        existingEntry.bytecodeHash !== bytecodeHash ||
                        existingEntry.deployedBytecodeHash !== deployedBytecodeHash ||
                        existingEntry.sourceHash !== sourceHash;
                }

                if (deploymentAddressExists && !regenerate && !infoChangedForDeployedAddress) {
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

                    if (!deploys.deployedAbis) {
                        deploys.deployedAbis = {};
                    }

                    if (!deploys.deployedAbis[abiHash]) {
                        deploys.deployedAbis[abiHash] = { latestDeployedAddress: entry.address, deployments: {} };
                    } else {
                        deploys.deployedAbis[abiHash].latestDeployedAddress = entry.address;
                    }

                    if (!deploys.deployedAbis[abiHash].deployments[entry.address]) {
                        deploys.deployedAbis[abiHash].deployments[entry.address] = {};
                    }

                    const newEntry = {
                        generatedAt,
                        truffleContractFileUpdatedAt: truffleContractFileContent.updatedAt,
                        deployTransactionHash: entry.transactionHash,
                        compiler: truffleContractFileContent.compiler,
                        bytecodeHash,
                        deployedBytecodeHash,
                        sourceHash,
                        source: truffleContractFileContent.source
                    };
                    deploys.deployedAbis[abiHash].deployments[entry.address] = newEntry;

                    const deploysFileNewContent = JSON.stringify(deploys, null, '  ');
                    filesLib
                        .writeFile(deploysFile, deploysFileNewContent)
                        .then(() => {
                            console.log(
                                `${
                                    deploymentAddressExists ? 'Updated' : 'Added'
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
