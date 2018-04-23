#!/usr/bin/env node
'use strict';

const pjson = require('./package.json');
const program = require('commander');
const filesLib = require('./lib/files');
const abiExtractor = require('./lib/abiExtractor');
const deploymentsExtractor = require('./lib/deploymentsExtractor');

program
    .version(pjson.version)
    .description(pjson.description)
    .usage('[options]')
    .option('-i, --input-dir [value]', 'Sets input directory with truffle contract json files.', './contracts/build')
    .option('-a, --abi-output-dir [value]', 'Sets abi output directory.', './abis')
    .option('-d, --deployments-output-dir [value]', 'Sets deployments output directory.', './deployments')
    .option('-r, --regenerate', 'Regenerate abi files even if they exists with same abi hash', false)
    .option('-c, --config-file [value]', 'Sets abiniser config file.', './abiniser.json');

program.on('--help', function() {
    console.log(
        `
  Examples:
      abiniser
        creates abi and network jsons from all truffle contract json files defined in config file
`
    );
});

program.parse(process.argv);

if (!filesLib.fileExists(program.configFile)) {
    console.error('Can\'t find abiniser config file: ', program.configFile);
    process.exit(1);
}

async function handler(program) {
    try {
        const config = filesLib.readJsonFile(program.configFile);
        const inputDir = program.inputDir || config.inputDir;
        const abiOutputDir = program.abiOutputDir || config.abiOutputDir;
        const deploymentsOutputDir = program.deploymentsOutputDir || config.deploymentsOutputDir;
        const regenerate = program.regenerate || config.regenerate;

        if (!filesLib.directoryExists(inputDir)) {
            console.error('Input directory doesn\'t exist: ', inputDir);
            process.exit(1);
        }

        if (!filesLib.directoryExists(abiOutputDir)) {
            try {
                await filesLib.mkdir(abiOutputDir);
            } catch (error) {
                console.error(
                    `Can't create abi output directory: ${abiOutputDir} - make sure parent directory exists\n${error}`
                );
                process.exit(1);
            }
            console.log('Abi output director created:', abiOutputDir);
        }

        if (!filesLib.directoryExists(deploymentsOutputDir)) {
            try {
                await filesLib.mkdir(deploymentsOutputDir);
            } catch (error) {
                console.error(
                    `Can't create deployments output directory: ${deploymentsOutputDir} - make sure parent directory exists\n${error}`
                );
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

            deploymentsExtractor.updateDeploymentsFile(content, deploymentsOutputDir, abiHash);
        });
    } catch (error) {
        console.error('Error:\n', error);
    }
}

console.log(`${pjson.name} v${pjson.version} - ${pjson.description}
`);

handler(program);
