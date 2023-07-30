import axios from "axios";

export default class SkldrClient {
    server: string;
    
    constructor(server: string) {
        this.server = server;
    }

    // [ ] promisify w/ a check the course exists
    getCourse(id: string) : SkldrCourse {
        return {} as SkldrCourse;
    }
    async getVersion(): Promise<string> {
        const resp = await axios.get(`${this.server}/version`);
        return resp.data;
    }
    async getRoles(): Promise<string[]> {
        const resp = await axios.get(`${this.server}/roles`);
        return resp.data;
    }
}

class SkldrCourse {
    id: string;
    server: string;
    
    constructor(server: string, id: string) {
        this.server = server;
        this.id = id;
    }

    addData(
     codeCourse: string,
     datashape: string,
     data: any,
     author: string,
     tags: string[],
     uploads: Blob[],
    ): Promise<Express.Response> {
        return axios.get(`${this.server}/${this.id}`, {
            method: 'GET',
            // body: 'todo',
        });
    }
}
