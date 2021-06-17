module.exports = {
  apps: [{
    name: 'video-stream',
    script: './src/index.ts',
    watch: true,
    instances: 1,
    exec_mode: 'fork',
    interpreter: 'node',
    interpreter_args: '--require ts-node/register --require tsconfig-paths/register',
  }],
}
