import fs = require('fs');
import childProcess = require('child-process-promise');
import { FFMPEG, LoudnessData } from './index';

/**
 * Returns normalized, base-64 encoded audio(/video)
 * 
 * @param fileData the base-64 encoded audio(/video) data from couchdb
 */
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
        let elongated = await childProcess.exec(FFMPEG + ` -i ${fileName} -af "adelay=10000|10000" ${PADDED}`);
        let info = await childProcess.exec(FFMPEG + ` -i ${PADDED} -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null -`);
        let data: LoudnessData = JSON.parse(info.stderr.substring(info.stderr.indexOf('{')));
        let paddedNormalized = await childProcess.exec(FFMPEG + ` -i ${PADDED} -af ` +
            `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${data.input_i}:` +
            `measured_LRA=${data.input_lra}:measured_TP=${data.input_tp}:` +
            `measured_thresh=${data.input_thresh}:offset=${data.target_offset}:linear=true:` +
            `print_format=summary -ar 48k ${PADDED_NORMALIZED}`);
        let normalized = await childProcess.exec(FFMPEG + ` -i ${PADDED_NORMALIZED} -ss 00:00:10.000 -acodec copy ${NORMALIZED}`);
        const ret = fs.readFileSync(NORMALIZED, {
            encoding
        });
        return ret;
    }
    catch (e) {
    }
    finally {
        let files = fs.readdirSync(tmpDir);
        files.forEach((file) => {
            fs.unlinkSync(tmpDir + '/' + file);
        });
        fs.rmdirSync(tmpDir);
    }
}
