
interface Request { }
interface Result {
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

    public addRequest(req: T) {

        this.queue.push({
            id: this.nextID++,
            request: req
        });

        if (!this.processing) {
            this.process();
        }
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
