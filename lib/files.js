'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Explores recursively a directory and returns all the filepaths and folderpaths in the callback.
 *
 * @see http://stackoverflow.com/a/5827895/4241030
 * @param {String} dir
 * @param {Function} done
 */
async function fileWalker(dir) {
    return new Promise((resolve, reject) => {
        let results = [];

        fs.readdir(dir, (err, list) => {
            if (err) reject(err);

            let pending = list.length;

            if (!pending) resolve(results);

            list.forEach(file => {
                file = path.resolve(dir, file);

                fs.stat(file, async (err, stat) => {
                    // If directory, execute a recursive call
                    if (stat && stat.isDirectory()) {
                        // Add directory to array [comment if you need to remove the directories from the array]
                        //results.push(file);

                        const res = await fileWalker(file);

                        results = results.concat(res);
                        if (!--pending) resolve(results);
                    } else {
                        results.push(file);

                        if (!--pending) resolve(results);
                    }
                });
            });
        });
    });
}

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
    },

    fileWalker
};
