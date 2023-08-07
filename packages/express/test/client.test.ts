import { ChildProcess, exec } from 'child_process';
import Client from '../src/client';
import env from '../src/utils/env';

let serverProcess: ChildProcess;
const client: Client = new Client('http://localhost:3000');

beforeAll(async () => {
    serverProcess = exec('yarn serve', (err, stdout, stderr) => {});

    // startup time for server.
    // [ ] replace w/ an actual ready check
    return await new Promise((resolve) => setTimeout(resolve, 7000));
}, 10_000)

test('getVersion', async () => {
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
