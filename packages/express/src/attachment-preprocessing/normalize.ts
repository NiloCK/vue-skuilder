import fs = require('fs');
import logger from '../logger';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
const exec = promisify(execCallback);

import FFMPEG from 'ffmpeg-static';
logger.info(`FFMPEG path: ${FFMPEG}`);

checkFFMPEGVersion().catch((e) => {
  const msg = 'FFMPEG version check failed';
  logger.error(msg, e);
  throw new Error(msg + e);
});

async function checkFFMPEGVersion() {
  try {
    if (!FFMPEG) {
      const e = 'FFMPEG executable not found';
      logger.error(e);
      throw new Error(e);
    }
    if (!fs.existsSync(FFMPEG)) {
      const e = `FFMPEG executable not found at path: ${FFMPEG}`;
      logger.error(e);
      throw new Error(e);
    }

    const result = await exec(`${FFMPEG} -version`);
    const version = result.stdout.split('\n')[0];
    logger.info(`FFMPEG version: ${version}`);

    // Verify loudnorm filter availability
    const filters = await exec(`${FFMPEG} -filters | grep loudnorm`);
    if (!filters.stdout.includes('loudnorm')) {
      throw new Error('loudnorm filter not available');
    }
  } catch (error) {
    logger.error('FFMPEG version check failed:', error);
    throw error;
  }
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
export async function normalize(fileData: string): Promise<string> {
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
    // elongate
    await exec(FFMPEG + ` -i ${fileName} -af "adelay=10000|10000" ${PADDED}`);
    const info = await exec(
      FFMPEG + ` -i ${PADDED} -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null -`
    );
    const data: LoudnessData = JSON.parse(info.stderr.substring(info.stderr.indexOf('{')));
    // normalize the elongated file
    await exec(
      FFMPEG +
        ` -i ${PADDED} -af ` +
        `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${data.input_i}:` +
        `measured_LRA=${data.input_lra}:measured_TP=${data.input_tp}:` +
        `measured_thresh=${data.input_thresh}:offset=${data.target_offset}:linear=true:` +
        `print_format=summary -ar 48k ${PADDED_NORMALIZED}`
    );
    // cut off the elongated part
    await exec(FFMPEG + ` -i ${PADDED_NORMALIZED} -ss 00:00:10.000 -acodec copy ${NORMALIZED}`);
    const ret = fs.readFileSync(NORMALIZED, {
      encoding,
    });
    return ret;
  } catch (e) {
    logger.error(e);
    throw e;
  } finally {
    const files = fs.readdirSync(tmpDir);
    files.forEach((file) => {
      fs.unlinkSync(tmpDir + '/' + file);
    });
    fs.rmdirSync(tmpDir);
  }
}
