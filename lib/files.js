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

    mkDirByPathSync: (targetDir, { isRelativeToScript = false } = {}) => {
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';

        targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(baseDir, parentDir, childDir);
            try {
                fs.mkdirSync(curDir);
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    throw err;
                }
            }

            return curDir;
        }, initDir);
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
