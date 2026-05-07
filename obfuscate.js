const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.error('No script tag found'); process.exit(1); }
const js = scriptMatch[1];

const obfuscated = JavaScriptObfuscator.obfuscate(js, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.4,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.3,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: true,
    selfDefending: false,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 6,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 3,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 1.0,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
});

const result = obfuscated.getObfuscatedCode();
const newHtml = html.replace(/<script>[\s\S]*?<\/script>/, '<script>' + result + '</script>');
fs.writeFileSync('index.html', newHtml);
console.log('Obfuscation complete! Output size: ' + result.length + ' chars');
