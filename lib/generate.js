'use strict';
const abiExtractor = require('./abiExtractor');
const deploymentsExtractor = require('./deploymentsExtractor');
const filesLib = require('./files');

function generate(options) {
    try {
        if (!filesLib.fileExists(options.configFile)) {
            console.error('Can\'t find abiniser config file: ', options.configFile);
            process.exit(1);
        }

        const config = filesLib.readJsonFile(options.configFile);
        const inputDir = options.inputDir || config.inputDir;
        const abiOutputDir = options.abiOutputDir || config.abiOutputDir;
        const deploymentsOutputDir = options.deploymentsOutputDir || config.deploymentsOutputDir;
        const regenerate = options.regenerate || config.regenerate;
        const networkId = options.networkId || config.networkId;
        const sourceInclude = options.sourceInclude || config.sourceInclude;

        if (!filesLib.directoryExists(inputDir)) {
            console.error('Input directory doesn\'t exist: ', inputDir);
            process.exit(1);
        }

        if (!filesLib.directoryExists(abiOutputDir)) {
            try {
                filesLib.mkDirByPathSync(abiOutputDir);
            } catch (error) {
                console.error(`Can't create abi output directory ${abiOutputDir}:\n${error}`);
                process.exit(1);
            }
            console.log('Abi output director created:', abiOutputDir);
        }

        if (!filesLib.directoryExists(deploymentsOutputDir)) {
            try {
                filesLib.mkDirByPathSync(deploymentsOutputDir);
            } catch (error) {
                console.error(`Can't create deployments output directory ${deploymentsOutputDir}\n${error}`);
                process.exit(1);
            }
            console.log('Deployments output director created:', deploymentsOutputDir);
        }

        if (!config.truffleContractFiles || config.truffleContractFiles.length === 0) {
            console.error(
                'No truffle input files specified. Set it in config file (abiniser.json). \n  Format: { truffleContractFiles: ["file1.json", "file2.json"] }'
            );
            process.exit(1);
        }

        const truffleContractFiles = config.truffleContractFiles.map(file => inputDir + '/' + file);

        truffleContractFiles.forEach(file => {
            if (!filesLib.fileExists(file)) {
                console.error('Can\'t find input truffle contract file:', file);
                process.exit(1);
            }
        });

        truffleContractFiles.forEach(truffleContract => {
            console.log('Processing:', truffleContract);
            const content = filesLib.readJsonFile(truffleContract);

            const abiHash = abiExtractor.generateAbiFile(content, abiOutputDir, regenerate);

            deploymentsExtractor.updateDeploymentsFile(
                content,
                deploymentsOutputDir,
                abiHash,
                regenerate,
                networkId,
                sourceInclude
            );
        });
    } catch (error) {
        console.error('Error:\n', error);
    }
}

module.exports = generate;
