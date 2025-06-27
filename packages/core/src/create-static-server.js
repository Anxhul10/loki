/* eslint-disable consistent-return */
const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

async function sendFile(res, filePath) {
  const file = await fs.promises.open(filePath, 'r');
  try {
    const stat = await file.stat();
    if (!stat.isFile()) {
      const err = new Error('Path is directory');
      err.code = 'EISDIR';
      throw err;
    }
    const contentType = mime.contentType(path.basename(filePath));

    const headers = {
      'Content-Length': stat.size,
      'Cache-Control': 'no-store, must-revalidate',
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    res.writeHead(200, headers);

    const readStream = file.createReadStream({ autoClose: true });
    readStream.pipe(res, { end: true });
    readStream.on('close', () => {
      file.close();
    });
  } catch (err) {
    file.close();
    throw err;
  }
}

const createStaticServer = (dir) => {
  const setHeaders = (res) => {
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
  };
  const app = express();
  app.use(express.static(dir, { setHeaders }));
  return app;
};

module.exports = { createStaticServer };
