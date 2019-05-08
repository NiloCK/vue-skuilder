import fs = require('fs');
import ffmpeg = require('ffmpeg-static');
import childProcess = require('child-process-promise');
import CouchDB from '../couchdb';
import nano = require('nano');

const FFMPEG = ffmpeg.path;

interface LoudnessData {  // these are numbers, but will be parsed as strings
    input_i: string; //number;
    input_tp: string; //number;
    input_lra: string; //number;
    input_thresh: string; //number;
    output_i: string; //number;
    output_tp: string; //number;
    output_lra: string; //number;
    output_thresh: string; //number;
    normalization_type: string; // this one is actually a string
    target_offset: string; //number;
}

export default async function postProcess() {
    console.log(`Following db for changes...`);
    CouchDB.db.follow('skuilder', {
        feed: "continuous",
        // since: "now",
        db: "skuilder",
        include_docs: true
    }, filterChanges);
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
        // processDocAttachments(processingRequest);
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
                // console.log(`Original  data: ${attachment}`);
                // console.log(`Converted data: ${converted}`);
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


export async function normalize(fileData) {
    const encoding = 'base64';

    const tmpDir = fs.mkdtempSync(`audioNormalize-${encoding}-`);
    const fileName = tmpDir + '/file.mp3';

    fs.writeFileSync(fileName, fileData, {
        encoding
    });

    let ext = '.' + fileName.split('.')[1];

    const PADDED = tmpDir + '/padded' + ext;
    const PADDED_NORMALIZED = tmpDir + '/paddedNormalized' + ext;
    const NORMALIZED = tmpDir + '/normalized' + ext;

    try {

        let elongated = await childProcess.exec(
            FFMPEG + ` -i ${fileName} -af "adelay=10000|10000" ${PADDED}`
        );
        let info = await childProcess.exec(
            FFMPEG + ` -i ${PADDED} -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null -`
        );
        // console.log(`stderr output: ${info.stderr}`);
        // console.log(`stdout output: ${info.stdout}`);
        let data: LoudnessData = JSON.parse(
            info.stderr.substring(
                info.stderr.indexOf('{')
            )
        );
        let paddedNormalized = await childProcess.exec(
            FFMPEG + ` -i ${PADDED} -af ` +
            `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${data.input_i}:` +
            `measured_LRA=${data.input_lra}:measured_TP=${data.input_tp}:` +
            `measured_thresh=${data.input_thresh}:offset=${data.target_offset}:linear=true:` +
            `print_format=summary -ar 48k ${PADDED_NORMALIZED}`
        );
        let normalized = await childProcess.exec(
            FFMPEG + ` -i ${PADDED_NORMALIZED} -ss 00:00:10.000 -acodec copy ${NORMALIZED}`
        );

        const ret = fs.readFileSync(NORMALIZED, {
            encoding
        });

        return ret;
    } catch (e) {

    } finally {

        let files = fs.readdirSync(tmpDir);
        files.forEach((file) => {
            fs.unlinkSync(tmpDir + '/' + file);
        });
        fs.rmdirSync(tmpDir);
    }


}
