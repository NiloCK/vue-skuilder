import axios from "axios";

interface SkldrClient {
    getCourse(id: string) : SkldrCourse // promisify w/ a check the course exists
    getVersion(): Promise<string>
    getRoles(): Promise<string[]>
}

interface SkldrCourse {
    addData: (
     codeCourse: string,
     datashape: string,
     data: any,
     author: string,
     tags: string[],
     uploads: Blob[],
    ) => Promise<Express.Response>
}

export default function createClient(server: string): SkldrClient {
    const client = {} as SkldrClient;

    client.getCourse = function(courseID: string) {

        const course: SkldrCourse = {} as SkldrCourse;

        course.addData = function(
            codeCourse: string,
            shape: string,
            data: any,
            author: string,
            tags: string[],
            uploads: Blob[]
        ) {
            return axios.get(`${server}`, {
                method: 'POST',
                // body: 'todo',
            });
        }

        return course;
    };

    client.getVersion = async function() {
        const resp = await axios.get(`${server}/version`);
        return resp.data;
    }

    return client;
}
