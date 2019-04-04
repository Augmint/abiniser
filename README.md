# Abiniser

Truffle post processor to generate and maintain ABI and deployments files for FE use. Abiniser aims to address the shortcoming of truffle-contract json format which can't handle multiple deployments of same contract source file and can't manage multiple ABI versions.

Abiniser works on files generated by truffle and its output keeps track of abi version and deployments on different networks.

Abineser's abi and deployment files output is intended to be added to repository so it can be used by front end code.

It's an alpha implementation, being tested on [Augmint](https://github.com/Augmint) projects. Expect breaking changes (e.g. output format changes) even with minor version bumps.

# Usage

## Install

```
$ npm -g install abiniser
```

## Workflow

Each time your abis changed or a new deployment (to any network) done abiniser should be run. It will automatically create new abi file version (based on abi hash) and will add new entries to deployment files.
These can be safely checked in

TODO: more description on the workflow

## Run

```
$ abiniser -h

Usage: abiniser [options]

Truffle post processor to generate ABI and deployment repository files

Options:

  -V, --version                         output the version number
  -i, --input-dir [value]               Sets input directory with truffle contract json files. (default: ./build/contracts)
  -a, --abi-output-dir [value]          Sets abi output directory. (default: ./abiniser/abis)
  -d, --deployments-output-dir [value]  Sets deployments output directory. (default: ./abiniser/deployments)
  -r, --regenerate                      Regenerate abi and deploy files even if they exists with same abi hash
  -n, --network-id [value]              Generate deployments file only for the given network id number
  -c, --config-file [value]             Sets abiniser config file. (default: ./abiniser.json)
  -s, --source-include                  Include contract source in generated deploy file
  -h, --help                            output usage information

More info: https://github.com/Augmint/abiniser

Examples:
    abiniser
      Creates abi and deployments jsons from all truffle contract json files listed in abiniser.json config file
```

Create `abiniser.json` file with the list of contract files to work on:

```
{
    "truffleContractFiles": ["Contract1.json", "Contract2.json"]
}
```

You can set command line options in `abiniser.json` too.

# Output format

## Abi files

One file per contract and abi version is generated:

`abiniser/abis/<Contract Name>_<Abi version hash>.json`

Each file contains the contract's Abi in [Solidity ABI JSON format](https://solidity.readthedocs.io/en/develop/abi-spec.html#abi-json).

## Deployment files

`abiniser/deployments/<Network Id>/<Contract Name>_DEPLOYS.json` files:

```
{
    "contractName": "<contract name>",
    "latestAbiHash": "7fde219f…",
    "deployedAbis": {
        "7fde219f…": {
            "latestDeployedAddress": "7fde219f…",
            "deployments": {
                "7fde219f…": {
                    "generatedAt": "<ISO86901 timestamp>",
                    "truffleContractFileUpdatedAt": "<ISO86901 timestamp when source truffle contracts json was generated>",
                    "deployTransactionHash": "0x12…",
                    "compiler": {
                        "name": "solc",
                        "version": "0.4.23"
                    },
                    "sourceHash": "7fde219f…",
                    "bytecodeHash": "a454e8ba…",
                    "deployedBytecodeHash": "55abcee…",
                    "source": "<source code from truffle contract json>"
                }
                "0xab444b...": {…}
            }
        },

        "a454e8ba… ": {
            "latestDeployedAddress": "a9de219f…",
            "deployments": {…}
        }
    }
}
```

## Contribution

Issue reports, feature suggestions and PRs are more than welcome.

## Authors

### Initial version

-   concept: [phraktle](https://github.com/phraktle) & [szerintedmi](https://github.com/szerintedmi)
-   [szerintedmi](https://github.com/szerintedmi)

Check the whole team on [augmint.cc](http://www.augmint.cc)

## Licence

This project is licensed under the MIT license - see the [LICENSE](LICENSE) file for details.
