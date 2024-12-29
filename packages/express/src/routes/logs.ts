import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { requestIsAdminAuthenticated } from '../couchdb/authentication';
import logger from '../logger';
import process from 'process';

const router = express.Router();

// Get list of available log files
router.get('/', async (req, res) => {
  // [ ] add an auth mechanism. Below fcn is based on
  //     the CouchDB auth mechanism, forwarded from the web-app (not direct-access of server).
  //
  // const auth = await requestIsAdminAuthenticated(req);
  // if (!auth) {
  //   res.status(401).json({ error: 'Unauthorized' });
  //   return;
  // }

  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const files = await fs.readdir(logsDir);

    // Create HTML content
    const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Log Files</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                h1 {
                  color: #333;
                }
                .log-list {
                  list-style: none;
                  padding: 0;
                }
                .log-list li {
                  margin: 10px 0;
                }
                .log-list a {
                  color: #0066cc;
                  text-decoration: none;
                  padding: 5px;
                }
                .log-list a:hover {
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <h1>Available Log Files</h1>
              <ul class="log-list">
                ${files
                  .map(
                    (file) => `
                  <li>
                    <a href="/logs/${file}">${file}</a>
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </body>
          </html>
        `;

    res.type('html').send(html);
  } catch (error) {
    logger.error('Error reading logs directory:', error);
    res.status(500).json({ error: 'Failed to retrieve log files' });
  }
});

// Get contents of specific log file
router.get('/:filename', async (req, res) => {
  // const auth = await requestIsAdminAuthenticated(req);
  // if (!auth) {
  //   res.status(401).json({ error: 'Unauthorized' });
  //   return;
  // }

  try {
    const filename = req.params.filename;
    // Sanitize filename to prevent directory traversal
    if (filename.includes('..') || !filename.match(/^[a-zA-Z0-9-_.]+$/)) {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }

    const logPath = path.join(process.cwd(), 'logs', filename);
    const content = (await fs.readFile(logPath, 'utf-8')).toString();

    // If the client requests JSON format
    if (req.headers.accept === 'application/json') {
      const lines = content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return line;
          }
        });
      res.json(lines);
    } else {
      // Return plain text by default
      res.type('text/plain').send(content);
    }
  } catch (error) {
    logger.error(`Error reading log file ${req.params.filename}:`, error);
    res.status(500).json({ error: 'Failed to retrieve log file' });
  }
});

export default router;
