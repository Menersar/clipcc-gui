/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const moment = require('moment');

const isProduction = process.env.NODE_ENV === 'production';
const time = new Date();

let commitHash = 'unknown';
try {
    commitHash = childProcess.execSync('git show -s --format=%h').toString().trim();
} catch (err) {
    console.warn('WARNING: Can\'t get last commit hash. Use \'unknown\' instead.');
}

const code = `// Generated by gen-meta.js
const appName = 'ClipCC';

const isProd = ${isProduction};
const appVersion = '3.1.2';
const appVersionSimple = '3.1.2';
const appVersionFull = '3.1.2-${commitHash}-b${moment.utc(time).format('YYYYMMDDHHmm')}';
const compileTime = '${moment.utc(time).format('YYYY/MM/DD HH:mm:ss')}';
const commitHash = '${commitHash}';

export {
    isProd, appVersion, appVersionFull, compileTime, commitHash
};
`;

fs.writeFileSync(path.join(__dirname, 'src/lib/app-info.js'), code);

const ENABLE_PWA = process.env.ENABLE_PWA;

if (ENABLE_PWA) {
    let data = fs.readFileSync(path.join(__dirname, 'static/sw.js'), {encoding: 'utf-8'});
    data = data.replace('gen@appVer', moment.utc(time).format('YYYYMMDDHHmm'));
    fs.writeFileSync(path.join(__dirname, 'static/sw.build.js'), data);
}
