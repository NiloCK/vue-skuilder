import ffmpeg = require('ffmpeg-static');
import fs = require('fs');
import childProcess = require('child-process-promise');
import logger from '../logger';

// @ts-ignore
const FFMPEG = ffmpeg.path;
logger.info(`FFMPEG path: ${FFMPEG}`);
if (!fs.existsSync(FFMPEG)) {
  const e = `FFMPEG executable not found at path: ${FFMPEG}`;
  logger.error(e);
  throw new Error(e);
}

/**
 * From FFMPEG's loudnorm output - loudness data on a media file
 */
interface LoudnessData {
  // these are numbers, but will be parsed as strings
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

/**
 * Returns normalized, base-64 encoded mp3
 *
 * @param fileData the base-64 encoded mp3 data from couchdb
 */
export async function normalize(fileData) {
  const encoding = 'base64';
  const tmpDir = fs.mkdtempSync(`audioNormalize-${encoding}-`);
  const fileName = tmpDir + '/file.mp3';

  fs.writeFileSync(fileName, fileData, {
    encoding,
  });

  const ext = '.' + fileName.split('.')[1];

  const PADDED = tmpDir + '/padded' + ext;
  const PADDED_NORMALIZED = tmpDir + '/paddedNormalized' + ext;
  const NORMALIZED = tmpDir + '/normalized' + ext;

  try {
    const elongated = await childProcess.exec(
      FFMPEG + ` -i ${fileName} -af "adelay=10000|10000" ${PADDED}`
    );
    const info = await childProcess.exec(
      FFMPEG + ` -i ${PADDED} -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null -`
    );
    const data: LoudnessData = JSON.parse(info.stderr.substring(info.stderr.indexOf('{')));
    const paddedNormalized = await childProcess.exec(
      FFMPEG +
        ` -i ${PADDED} -af ` +
        `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${data.input_i}:` +
        `measured_LRA=${data.input_lra}:measured_TP=${data.input_tp}:` +
        `measured_thresh=${data.input_thresh}:offset=${data.target_offset}:linear=true:` +
        `print_format=summary -ar 48k ${PADDED_NORMALIZED}`
    );
    const normalized = await childProcess.exec(
      FFMPEG + ` -i ${PADDED_NORMALIZED} -ss 00:00:10.000 -acodec copy ${NORMALIZED}`
    );
    const ret = fs.readFileSync(NORMALIZED, {
      encoding,
    });
    return ret;
  } catch (e) {
    logger.error(e);
  } finally {
    const files = fs.readdirSync(tmpDir);
    files.forEach((file) => {
      fs.unlinkSync(tmpDir + '/' + file);
    });
    fs.rmdirSync(tmpDir);
  }
}
