'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },

    directoryExists: filePath => {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    },

    fileExists: file => {
        return fs.existsSync(file);
    },

    mkdir: dir => {
        return new Promise(function(resolve, reject) {
            fs.mkdir(dir, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    readJsonFile: file => {
        const content = fs.readFileSync(file);
        return JSON.parse(content);
    },

    writeFile: (file, data, encoding) => {
        return new Promise(function(resolve, reject) {
            fs.writeFile(file, data, encoding, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};
