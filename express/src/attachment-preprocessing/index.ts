import CouchDB from '../couchdb';
import nano = require('nano');
import { normalize } from './normalize';

/**
 * Connect to CouchDB, monitor changes to uploaded card data,
 * perform post-processing on uploaded media
 */
export default async function postProcess() {
    console.log(`Following db for changes...`);
    CouchDB.db.follow('skuilder', {
        feed: "continuous",
        // since: "now",
        db: "skuilder",
        include_docs: true
    }, filterChanges);
}

async function filterChanges(error, response: DatabaseChangesResultItemWithDoc, headers?) {
    // console.log(`Change detected: ${JSON.stringify(response['seq'])}`);
    if (
        response.doc._attachments &&
        (
            response.doc['processed'] === undefined ||
            response.doc['processed'] === false
        )
    ) {
        const processingRequest: ProcessingRequest = {
            docID: response.doc._id,
            fields: []
        };
        const atts = response.doc._attachments;
        for (let attachment in atts) {
            const content_type: string = atts[attachment]['content_type'];
            console.log(`Attachment ${attachment} in doc ${response.doc._id} should be processed`);
            if (content_type.includes('audio')) {
                processingRequest.fields.push({
                    name: attachment,
                    mimetype: content_type
                });
            }
        }
        q.addRequest(processingRequest);
    }
}

class ProcessingQueue {
    private queue: ProcessingRequest[] = [];
    private problemQueue: ProcessingRequest[] = [];

    public addRequest(req: ProcessingRequest) {

        this.queue.push(req);
        if (!this.processing) {
            this.process();
        }
    }

    private processing: boolean = false;
    private async process() {
        this.processing = true;

        while (this.queue.length > 0) {
            console.log(`Processing: ${this.queue[0].docID}`)
            try {
                const result = await processDocAttachments(this.queue[0]);
                if (result.ok) {
                    this.queue.shift();
                } else {
                    this.problemQueue.push(this.queue[0]);
                    this.queue.shift();
                }
            } catch (e) {
                this.problemQueue.push(this.queue[0]);
                this.queue.shift();
                console.log(`Caught Exception in DocQueue: ${e}`);
            }
        }

        this.processing = false;
    }
}

const q = new ProcessingQueue();

async function processDocAttachments(request: ProcessingRequest) {
    const skuilder = CouchDB.use(`skuilder`);
    const doc = await skuilder.get(request.docID, {
        attachments: true,
        att_encoding_info: true
    });

    for (const field of request.fields) {
        console.log(`Converting ${field.name}`);
        const attachment = doc._attachments[field.name].data;
        if (field.mimetype.includes('audio')) {
            try {
                const converted = await normalize(attachment);
                field.returnData = converted;
            } catch (e) {
                console.log(`Exception caught: ${e}`);
                throw (e);
            }
        }
    }

    console.log('Conversions finished');

    request.fields.forEach((field) => {
        console.log(`Replacing doc Data for ${field.name}`);
        if (doc['processed']) {
            (doc['processed'] as string[]).push(field.name);
        } else {
            doc['processed'] = [field.name];
        }
        doc._attachments[field.name].data = field.returnData;
    });

    const resp = await skuilder.insert(doc);
    console.log(`Processing request reinsert result: ${JSON.stringify(resp)}`);
    return resp;
}

interface DatabaseChangesResultItemWithDoc extends nano.DatabaseChangesResultItem {
    doc: nano.DocumentGetResponse
}

interface ProcessingRequest {
    docID: string;
    fields: ProcessingField[];
}
interface ProcessingField {
    name: string;
    mimetype: string;
    returnData?: any;
}
