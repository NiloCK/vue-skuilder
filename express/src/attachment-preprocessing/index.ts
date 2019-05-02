import fs = require('fs');
import ffmpeg = require('ffmpeg-static');
import childProcess = require('child-process-promise');

const FFMPEG = ffmpeg.path;

export async function normalize(file: string) {
    let ff = await childProcess.exec(FFMPEG + ' -h');
    console.log(`Error: ${ff.stderr}`);
    console.log(`Out: ${ff.stdout}`);
}
