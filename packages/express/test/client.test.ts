import { ChildProcess, exec } from 'child_process';
import getClient from '../src/client';
import env from '../src/utils/env';

let serverProcess: ChildProcess;

beforeAll(async () => {
    serverProcess = exec('yarn serve', (err, stdout, stderr) => {});

    // startup time for server.
    // [ ] replace w/ an actual ready check
    return await new Promise((resolve) => setTimeout(resolve, 3000));
})

test('getVersion', async () => {
    const client = getClient('http://localhost:3000');
    const version = await client.getVersion();
    expect(version).toBe(env.VERSION);
});

afterAll(async () => {
    // see https://stackoverflow.com/questions/54562879/jest-open-handle-when-using-node-exec/75830272#75830272
    serverProcess.stdin.destroy();
    serverProcess.stdout.destroy();
    serverProcess.stderr.destroy();
    
    serverProcess.kill();
    serverProcess.unref();
});
