import { ChildProcess, exec } from 'child_process';
import { CourseConfig } from '../../vue/src/server/types';
import Client from '../src/client';
import env from '../src/utils/env';

let serverProcess: ChildProcess;
const client: Client = new Client('http://localhost:3000');
const credentials = {
    username: env.COUCHDB_ADMIN,
    password: env.COUCHDB_PASSWORD,
}

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

test('Course Methods', async () => {
    const testCourse: CourseConfig = createTestCourse();

    // assert non-existence of test course
    const courses = await client.getCourses();
    expect( courses.find((c) => c.split(' - ')[1] === testCourse.name) ).toBeUndefined();

    // create test course
    const createResp = await client.createCourse(testCourse, credentials);
    expect(createResp.data?.ok).toBe(true);
    expect(createResp.data?.courseID).not.toBe('');
    const courseID = createResp.data!.courseID;

    // assert existence of test course
    const courses2 = await client.getCourses();
    expect( courses2.find((c) => c.split(' - ')[1] === testCourse.name) ).toBeDefined();
    expect( courses2.find((c) => c.split(' - ')[0] === courseID) ).toBeDefined();
    
    // delete test course
    const crsClient = client.getCourseClient(courseID);
    await crsClient.deleteCourse(credentials);

    // assert non-existence of test course
    const courses3 = await client.getCourses();
    expect( courses3.find((c) => c.split(' - ')[0] === courseID) ).toBeUndefined();
});

test('createNote', async () => {
    const crs = createTestCourse();
    const createResp = await client.createCourse(crs, credentials);

    const crsClient = client.getCourseClient(createResp.data!.courseID);
    const cfg = await crsClient.getConfig();

    for (const k in crs) {
        expect(cfg[k]).toEqual(crs[k]);
    }
    // expect(cfg).toEqual(crs);
    crsClient.addData({
        author: 'test-author',
        data: "this is a test",
        tags: ['test-tag'],
        courseID: crsClient.id,
        codeCourse: 'test-code-course-id',
        shape: {
            fields: [],
            name: DataShapeName.Blanks,
        },
    })
});
afterAll(async () => {
    // see https://stackoverflow.com/questions/54562879/jest-open-handle-when-using-node-exec/75830272#75830272
    serverProcess.stdin.destroy();
    serverProcess.stdout.destroy();
    serverProcess.stderr.destroy();
    
    serverProcess.kill();
    serverProcess.unref();
});

/**
 * @returns a course config with a randomized name
 */
function createTestCourse(): CourseConfig {
    const salt = Math.random();
    const name = 'test-course-' + salt;

    const testCourse: CourseConfig = {
        name,
        description: 'test-course',
        admins: ['test-admin'],
        creator: 'test-creator',
        dataShapes: [],
        questionTypes: [],
        deleted: false,
        moderators: [],
        public: true,
    };
    return testCourse;
}

