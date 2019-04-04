#!/usr/bin/env node
'use strict';

const pjson = require('./package.json');
const program = require('commander');
const generate = require('./lib/generate.js');
const removeSourceEntries = require('./lib/removeSourceEntries.js');

function help() {
    console.log(
        `
  More info: https://github.com/Augmint/abiniser

  Examples:
      abiniser generate
        Creates abi and deployments jsons from all truffle contract json files listed in abiniser.json config file
`
    );
}

program.version(pjson.version).description(pjson.description);

program
    .command('generate')
    .description('Generate deployment and abi files from Truffle generated JSON files')
    .alias('gen')

    .option('-c, --config-file [value]', 'Sets abiniser config file.', './abiniser.json')
    .option('-a, --abi-output-dir [value]', 'Sets abi output directory.', './abiniser/abis')
    .option('-d, --deployments-output-dir [value]', 'Sets deployments output directory.', './abiniser/deployments')
    .option('-n, --network-id [value]', 'Generate deployments file only for the given network id number')

    .option('-i, --input-dir [value]', 'Sets input directory with truffle contract json files.', './build/contracts')
    .option('-r, --regenerate', 'Regenerate abi and deploy files even if they exists with same abi hash', false)
    .option('-s, --source-include', 'Include contract source in generated deploy file', false)
    .action(options => generate(options));

program
    .command('removeSourceEntries')
    .alias('removeSrc')
    .description('remove source entries from all deployment files')
    .option(
        '-d, --deployments-output-dir [value]',
        'Sets deployments output directory to work on.',
        './abiniser/deployments'
    )
    .action(options => removeSourceEntries(options));

program.on('--help', () => help());

program.on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
});

program.parse(process.argv);

console.log(`
${pjson.name} v${pjson.version} - ${pjson.description}`);
