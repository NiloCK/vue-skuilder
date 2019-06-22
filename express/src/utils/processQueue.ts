
interface Request { }
interface Result {
    status: 'ok' | 'awaiting' | 'warning' | 'error';
    ok: boolean;
    error?: any;
}

interface ProcessingFunction<T> {
    (data: T): Promise<Result>;
}
interface LabelledRequest<R> {
    id: number;
    request: R;
}

interface FailedRequest<R> extends LabelledRequest<R> {
    error: any
}
interface CompletedRequest<R> extends LabelledRequest<R> {
    result: Result
}

/**
 * This queue executes async prcesses sequentially, waiting
 * for each to complete before launching the next.
 */
export default class AsyncProcessQueue<T extends Request> {
    private queue: LabelledRequest<T>[] = [];
    private errors: FailedRequest<T>[] = [];
    private completed: CompletedRequest<T>[] = [];

    private processing: boolean = false;
    private nextID: number = 0;

    /**
     * Returns 'complete' if the job is complete, 'error' if the
     * job failed, and the job's position in queue if not yet
     * completed.
     * 
     * @param jobID The jobID returned by addRequest
     */
    public jobStatus(jobID: number): 'complete' | 'error' | number {
        let ret: any;
        this.queue.forEach((req) => {
            if (req.id === jobID) {
                ret = this.queue.indexOf(req);
            }
        });

        this.completed.forEach((req) => {
            if (req.id === jobID) {
                ret = 'complete';
            }
        });

        this.errors.forEach((req) => {
            if (req.id === jobID) {
                ret = 'error';
            }
        });

        return ret;
    }

    private async recurseGetResult(jobID: number, depth: number): Promise<Result> {
        // polling intervals in milliseconds
        console.log(`Checking job status of job ${jobID}...`);
        const intervals = [100, 200, 400, 800, 1000, 2000, 3000, 5000];
        depth = Math.min(depth, intervals.length - 1);

        let status: 'complete' | 'error' | number;

        const p = new Promise((resolve, reject) => {
            setTimeout(() => {
                status = this.jobStatus(jobID);
                if (status === 'complete' || status === 'error') {
                    resolve();
                } else {
                    reject();
                }
            }, intervals[depth], jobID)
        })

        return p.then(() => {
            return this.getResult(jobID);
        }).catch(() => {
            return this.recurseGetResult(jobID, depth + 1);
        });
    }

    public async getResult(jobID: number, depth: number = 0): Promise<Result> {
        const status = this.jobStatus(jobID);

        if (status === 'complete') {
            const res = this.completed.find((val) => {
                return val.id === jobID;
            });
            return res.result;
        } else if (status === 'error') {
            const res = this.errors.find((val) => {
                return val.id === jobID;
            });
            return {
                error: res.error,
                ok: false,
                status: 'error'
            };
        } else {
            return this.recurseGetResult(jobID, 0);
        }
    }

    public addRequest(req: T): number {
        const id: number = this.nextID++;

        this.queue.push({
            id: id,
            request: req
        });

        if (!this.processing) {
            this.process();
        }

        return id;
    }

    /**
     *
     */
    constructor(processingFcn: ProcessingFunction<T>) {
        this.processRequest = processingFcn;
    }

    private async process() {
        this.processing = true;

        while (this.queue.length > 0) {
            const req = this.queue[0];
            console.log(`Processing ${req.id}`);

            try {
                const result = await this.processRequest(req.request);
                if (result.ok) {
                    this.completed.push({
                        id: req.id,
                        request: req.request,
                        result: result
                    });
                } else {
                    this.errors.push({
                        id: req.id,
                        request: req.request,
                        error: result.error
                    });
                }
            }
            catch (e) {
                this.errors.push({
                    id: req.id,
                    request: req.request,
                    error: e
                });
            }
            finally {
                // remove the completed (or errored)
                // request from the queue
                this.queue.shift();
            }
        }

        this.processing = false;
    }

    private processRequest: ProcessingFunction<T>;
}
