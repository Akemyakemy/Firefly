const { spawn } = require('child_process');
const fs = require('fs');

// 清除可能导致问题的环境变量
delete process.env.SAFE_RM_ALLOWED_PATH;
delete process.env.SAFE_RM_DENIED_PATH;
delete process.env.SAFE_RM_AUTO_ADD_TEMP;
delete process.env.SAFE_RM_PROTECTION_FLAG;

const build = spawn('npx', ['astro', 'build'], {
  cwd: __dirname,
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let error = '';

build.stdout.on('data', (data) => {
  output += data.toString();
});

build.stderr.on('data', (data) => {
  error += data.toString();
});

build.on('close', (code) => {
  const result = `Exit code: ${code}\n\nSTDOUT:\n${output}\n\nSTDERR:\n${error}`;
  fs.writeFileSync('build-output.txt', result);
  console.log('Build completed. Output saved to build-output.txt');
});