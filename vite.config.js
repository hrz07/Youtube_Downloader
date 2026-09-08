import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function mediaStreamPlugin() {
  return {
    name: 'media-stream-plugin',
    configureServer(server) {
      server.middlewares.use('/api/media-stream', (req, res) => {
        try {
          const parsedUrl = new URL(req.url, 'http://127.0.0.1:5173');
          const filePath = parsedUrl.searchParams.get('path');

          if (!filePath || !fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('File not found');
            return;
          }

          let targetFile = filePath;
          if (fs.statSync(targetFile).isDirectory()) {
            const titleHint = parsedUrl.searchParams.get('title');
            const files = fs.readdirSync(targetFile);
            let matched = null;
            if (titleHint) {
              const safeHint = titleHint.replace(/[/\\?%*:|"<>]/g, '_').substring(0, 20).toLowerCase();
              matched = files.find((f) => f.toLowerCase().startsWith(safeHint) && !f.endsWith('.part'));
            }
            if (!matched) {
              const mediaFiles = files
                .filter((f) => /\.(mp4|webm|mkv|mp3|m4a|wav)$/i.test(f) && !f.endsWith('.part'))
                .map((f) => ({ name: f, time: fs.statSync(path.join(targetFile, f)).mtimeMs }))
                .sort((a, b) => b.time - a.time);
              if (mediaFiles.length > 0) {
                matched = mediaFiles[0].name;
              }
            }
            if (matched) {
              targetFile = path.join(targetFile, matched);
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain');
              res.end('No media file found in directory');
              return;
            }
          }

          const stat = fs.statSync(targetFile);
          const fileSize = stat.size;
          const ext = path.extname(targetFile).toLowerCase();

          let contentType = 'video/mp4';
          if (ext === '.mp3') contentType = 'audio/mpeg';
          else if (ext === '.m4a') contentType = 'audio/mp4';
          else if (ext === '.webm') contentType = 'video/webm';
          else if (ext === '.mkv') contentType = 'video/x-matroska';
          else if (ext === '.wav') contentType = 'audio/wav';

          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize) {
              res.statusCode = 416;
              res.setHeader('Content-Range', `bytes */${fileSize}`);
              res.end();
              return;
            }

            const chunksize = end - start + 1;
            const fileStream = fs.createReadStream(targetFile, { start, end });

            res.statusCode = 206;
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', chunksize);
            res.setHeader('Content-Type', contentType);
            fileStream.pipe(res);
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Length', fileSize);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Accept-Ranges', 'bytes');
            fs.createReadStream(targetFile).pipe(res);
          }
        } catch (err) {
          res.statusCode = 500;
          res.end(err.message);
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mediaStreamPlugin()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

