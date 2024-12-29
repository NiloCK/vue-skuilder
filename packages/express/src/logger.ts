import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const callerFormat = format((info) => {
  const error = new Error();
  const stackLines = error.stack?.split('\n');

  if (stackLines) {
    // Find the first line that isn't from node_modules or internal Winston code
    const callerLine = stackLines.find((line) => {
      return (
        line.includes('(') &&
        !line.includes('node_modules') &&
        !line.includes('logger.ts') &&
        !line.includes('winston')
      );
    });

    if (callerLine) {
      // Try to extract function name and location
      const match = callerLine.match(
        /at (?:(?:Object|Module)\.)?([a-zA-Z0-9_$.]+)? \((.+?):(\d+):(\d+)\)/
      );

      if (match) {
        const [, functionName = '<anonymous>', file, line] = match;
        // Clean up the file path - get just filename
        const fileName = file.split('/').pop() || file;
        info.caller = `${functionName} (${fileName}:${line})`;
      } else {
        // Handle edge cases (like anonymous functions)
        const basicMatch = callerLine.match(/\((.+?):(\d+):(\d+)\)$/);
        if (basicMatch) {
          const [, file, line] = basicMatch;
          const fileName = file.split('/').pop() || file;
          info.caller = `<anonymous> (${fileName}:${line})`;
        }
      }
    }
  }

  return info;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(callerFormat(), format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(
        callerFormat(),
        format.timestamp(),
        format.printf(({ level, message, timestamp, caller, ...rest }) => {
          const meta = Object.keys(rest).length ? JSON.stringify(rest) : '';
          return `${timestamp} [${level}] ${caller || 'unknown'} - ${message} ${meta}`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '7d',
      maxSize: '20m',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '20m',
    }),
  ],
});

export default logger;
