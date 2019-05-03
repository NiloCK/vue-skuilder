import fs = require('fs');
import ffmpeg = require('ffmpeg-static');
import childProcess = require('child-process-promise');

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

export async function normalize(fileName: string) {
    const tmpDir = fs.mkdtempSync('audioNormalize-');

    let ext = '.' + fileName.split('.')[1];

    const PADDED = tmpDir + '/padded' + ext;
    const PADDED_NORMALIZED = tmpDir + '/paddedNormalized' + ext;
    const NORMALIZED = tmpDir + '/normalized' + ext;

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

    let files = fs.readdirSync(tmpDir);
    files.forEach((file) => {
        fs.unlinkSync(tmpDir + '/' + file);
    });

    fs.rmdirSync(tmpDir);
}
