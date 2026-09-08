const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { execSync } = require('child_process');
const ytDlp = require('yt-dlp-exec');
const ffmpegStatic = require('ffmpeg-static');

// Internal local HTTP streaming server for smooth media playback (with Range header support)
let mediaServerPort = 0;
const mediaServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const parsedUrl = new URL(req.url, 'http://127.0.0.1');
    const filePath = parsedUrl.searchParams.get('path');

    if (!filePath || !fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();

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
        res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
        res.end();
        return;
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500);
      res.end(err.message);
    }
  }
});

mediaServer.listen(0, '127.0.0.1', () => {
  mediaServerPort = mediaServer.address().port;
  console.log(`[MediaServer] Internal streaming server running on port ${mediaServerPort}`);
});

// Robust process tree kill for Windows & POSIX
function killProcessTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch (_) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch (_) {}
  }
}

// Map to track active download child processes
const activeDownloads = new Map();

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'YouTube Downloader',
    icon: path.join(__dirname, '../public/favicon.png'),
    backgroundColor: '#f8fafd',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Open any external links in user's default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && fs.existsSync(distHtml)) {
    mainWindow.loadFile(distHtml);
  } else {
    const devUrl = 'http://127.0.0.1:5173';
    const tryLoad = (retries = 5) => {
      mainWindow.loadURL(devUrl).catch(() => {
        if (retries > 0) {
          setTimeout(() => tryLoad(retries - 1), 1000);
        } else if (fs.existsSync(distHtml)) {
          mainWindow.loadFile(distHtml);
        }
      });
    };
    tryLoad();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Terminate any remaining active downloads before quitting
  for (const [id, proc] of activeDownloads.entries()) {
    try {
      proc.kill('SIGKILL');
    } catch (_) {}
  }
  activeDownloads.clear();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean URL from radio mixes, playlists, and tracking parameters
function cleanYouTubeUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return '';
  const trimmed = inputUrl.trim();
  try {
    const parsed = new URL(trimmed);
    // Handle youtu.be/ID
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }
    // Handle youtube.com/shorts/ID or /watch?v=ID
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
        if (id) return `https://www.youtube.com/watch?v=${id}`;
      }
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/watch?v=${v}`;
    }
  } catch (_) {}
  return trimmed;
}

// IPC Handler: Get Video Information
ipcMain.handle('get-video-info', async (_event, url) => {
  try {
    if (!url || typeof url !== 'string' || !url.trim()) {
      throw new Error('Please provide a valid YouTube URL');
    }

    const cleanUrl = cleanYouTubeUrl(url);

    // Call yt-dlp to get video metadata with timeout
    const fetchMetadataPromise = ytDlp(cleanUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      preferFreeFormats: true,
      noCheckCertificates: true,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Analyzing timed out (25s). Please check your internet connection or URL.')), 25000)
    );

    const info = await Promise.race([fetchMetadataPromise, timeoutPromise]);

    // Extract available video resolutions
    const formats = info.formats || [];
    const availableHeights = new Set();
    let hasAudio = false;

    for (const f of formats) {
      if (f.vcodec && f.vcodec !== 'none' && f.height) {
        availableHeights.add(f.height);
      }
      if (f.acodec && f.acodec !== 'none') {
        hasAudio = true;
      }
    }

    // Standard resolutions mapping
    const resolutionTiers = [
      { height: 2160, label: '4K (2160p) Ultra HD' },
      { height: 1440, label: '2K (1440p) Quad HD' },
      { height: 1080, label: '1080p Full HD' },
      { height: 720, label: '720p HD' },
      { height: 480, label: '480p Standard' },
      { height: 360, label: '360p Compact' },
    ];

    // Filter available resolutions based on video stream
    const options = [];
    for (const tier of resolutionTiers) {
      const isAvailable = [...availableHeights].some((h) => h >= tier.height);
      if (isAvailable) {
        options.push({
          resolution: tier.height.toString(),
          label: tier.label,
          height: tier.height,
          type: 'video',
        });
      }
    }

    // Default fallback if no standard tier matched but formats exist
    if (options.length === 0) {
      options.push({
        resolution: 'best',
        label: 'Best Available Quality',
        height: 1080,
        type: 'video',
      });
    }

    // Add Audio-only option if audio exists
    if (hasAudio) {
      options.push({
        resolution: 'audio_only',
        label: 'Audio Only (MP3 / M4A 320kbps)',
        type: 'audio',
      });
    }

    // Extract best thumbnail
    let thumbnail = info.thumbnail;
    if (info.thumbnails && info.thumbnails.length > 0) {
      // Find highest resolution thumbnail
      const sorted = [...info.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
      if (sorted[0]?.url) {
        thumbnail = sorted[0].url;
      }
    }

    return {
      success: true,
      data: {
        id: info.id,
        title: info.title || 'Untitled Video',
        channel: info.uploader || info.channel || 'Unknown Channel',
        duration: info.duration || 0,
        thumbnail,
        webpageUrl: info.webpage_url || cleanUrl,
        resolutions: options,
      },
    };
  } catch (err) {
    let cleanError = err.message || 'Failed to extract video information.';
    if (err.stderr) {
      const errorLines = err.stderr
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.startsWith('ERROR:'));
      if (errorLines.length > 0) {
        cleanError = errorLines[0].replace(/^ERROR:\s*/, '');
      }
    }
    console.error('Failed to get video info:', cleanError);
    return {
      success: false,
      error: cleanError,
    };
  }
});

// Helper to sanitize filename
function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').substring(0, 150);
}

// Helper to execute download subprocess with pause/resume support
function executeDownloadProcess(payload, isResume = false) {
  const { id, url, title, resolution, isAudioOnly } = payload;
  const downloadsDir = app.getPath('downloads');

  try {
    const safeTitle = sanitizeFilename(title || 'video');
    const ext = isAudioOnly ? 'mp3' : 'mp4';
    const cleanUrl = cleanYouTubeUrl(url);
    const fileTag = isAudioOnly ? 'Audio' : `${resolution || 'Best'}`;

    let formatArg = 'bestvideo+bestaudio/best';
    if (isAudioOnly) {
      formatArg = 'bestaudio/best';
    } else if (resolution && resolution !== 'best') {
      formatArg = `bestvideo[height<=${resolution}]+bestaudio/best[height<=${resolution}]/best`;
    }

    const flags = {
      format: formatArg,
      output: path.join(downloadsDir, `${safeTitle} [${fileTag}].%(ext)s`),
      newline: true,
      noWarnings: true,
      noPlaylist: true,
      noCheckCertificates: true,
      continue: true, // Enable resuming partial downloads
    };

    if (ffmpegStatic) {
      flags.ffmpegLocation = ffmpegStatic;
    }

    if (isAudioOnly) {
      flags.extractAudio = true;
      flags.audioFormat = 'mp3';
      flags.audioQuality = '0';
    } else {
      flags.mergeOutputFormat = 'mp4';
    }

    // Spawn process using yt-dlp-exec
    const subprocess = ytDlp.exec(cleanUrl, flags);
    const record = {
      subprocess,
      payload,
      savedFilePath: null,
      isPaused: false,
      isCancelled: false,
    };
    activeDownloads.set(id, record);

    let savedFilePath = null;

    const progressRegex = /\[download\]\s+([\d\.]+)%\s+of\s+~?\s*([\d\.]+\s*\w+)(?:\s+at\s+([\d\.]+\s*\w+\/s))?(?:\s+ETA\s+([\d:]+))?/i;
    const destRegex = /\[(?:download|Merger|ExtractAudio)\]\s+Destination:\s+(.+)/i;
    const mergeRegex = /\[Merger\]\s+Merging formats into "(.+)"/i;

    const parseOutput = (chunk) => {
      if (record.isPaused || record.isCancelled) return;
      const text = chunk.toString();
      const lines = text.split(/\r?\n/);

      for (const line of lines) {
        if (record.isPaused || record.isCancelled) return;
        const trimmed = line.trim();
        if (!trimmed) continue;

        const mergeMatch = trimmed.match(mergeRegex);
        if (mergeMatch && mergeMatch[1]) {
          savedFilePath = mergeMatch[1];
          record.savedFilePath = savedFilePath;
        }
        const destMatch = trimmed.match(destRegex);
        if (destMatch && destMatch[1] && !savedFilePath) {
          savedFilePath = destMatch[1];
          record.savedFilePath = savedFilePath;
        }

        const match = trimmed.match(progressRegex);
        if (match) {
          const percent = parseFloat(match[1]) || 0;
          const totalSize = match[2] || 'Unknown';
          const speed = match[3] || '-- MB/s';
          const eta = match[4] || '--:--';

          if (mainWindow && !mainWindow.isDestroyed() && !record.isPaused && !record.isCancelled) {
            mainWindow.webContents.send('download-progress', {
              id,
              progress: percent,
              speed,
              eta,
              totalSize,
              status: percent >= 100 ? 'merging' : 'downloading',
            });
          }
        } else if (trimmed.includes('[Merger]') || trimmed.includes('[ExtractAudio]')) {
          if (mainWindow && !mainWindow.isDestroyed() && !record.isPaused && !record.isCancelled) {
            mainWindow.webContents.send('download-progress', {
              id,
              progress: 99,
              speed: 'Merging streams...',
              eta: 'Finalizing',
              status: 'merging',
            });
          }
        }
      }
    };

    if (subprocess.stdout) {
      subprocess.stdout.on('data', parseOutput);
    }
    if (subprocess.stderr) {
      subprocess.stderr.on('data', parseOutput);
    }

function resolveDownloadedFilePath(downloadsDir, safeTitle, fileTag, isAudioOnly, savedFilePath) {
  if (savedFilePath && fs.existsSync(savedFilePath) && fs.statSync(savedFilePath).isFile()) {
    return savedFilePath;
  }

  const ext = isAudioOnly ? 'mp3' : 'mp4';
  const candidate1 = path.join(downloadsDir, `${safeTitle} [${fileTag}].${ext}`);
  if (fs.existsSync(candidate1) && fs.statSync(candidate1).isFile()) {
    return candidate1;
  }

  const candidate2 = path.join(downloadsDir, `${safeTitle}.${ext}`);
  if (fs.existsSync(candidate2) && fs.statSync(candidate2).isFile()) {
    return candidate2;
  }

  // Search downloadsDir for matching prefix
  try {
    const files = fs.readdirSync(downloadsDir);
    const prefix = safeTitle.substring(0, Math.min(20, safeTitle.length)).toLowerCase();
    const match = files.find((f) => {
      const lower = f.toLowerCase();
      return (
        lower.startsWith(prefix) &&
        (lower.endsWith('.mp4') || lower.endsWith('.mp3') || lower.endsWith('.webm') || lower.endsWith('.mkv')) &&
        !lower.endsWith('.part')
      );
    });
    if (match) {
      return path.join(downloadsDir, match);
    }
  } catch (_) {}

  return candidate1;
}

    subprocess
      .then(() => {
        const finalPath = resolveDownloadedFilePath(downloadsDir, safeTitle, fileTag, isAudioOnly, savedFilePath);
        activeDownloads.delete(id);
        if (mainWindow && !mainWindow.isDestroyed() && !record.isPaused && !record.isCancelled) {
          mainWindow.webContents.send('download-complete', {
            id,
            filePath: finalPath,
          });
        }
      })
      .catch((err) => {
        if (record.isPaused) {
          // Successfully paused without triggering download-error
          record.subprocess = null;
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('download-progress', {
              id,
              speed: 'Paused',
              eta: '--',
              status: 'paused',
            });
          }
          return;
        }

        activeDownloads.delete(id);
        if (record.isCancelled || err.isCanceled || err.killed || err.signal === 'SIGTERM' || err.signal === 'SIGKILL') {
          return;
        }
        console.error('Download error:', err);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('download-error', {
            id,
            error: err.message || 'Download failed or was interrupted.',
          });
        }
      });

    return { success: true, id };
  } catch (err) {
    console.error('Failed to initiate download:', err);
    activeDownloads.delete(id);
    return { success: false, error: err.message };
  }
}

// IPC Handler: Start Download
ipcMain.handle('start-download', async (_event, payload) => {
  return executeDownloadProcess(payload, false);
});

// IPC Handler: Pause Download
ipcMain.handle('pause-download', async (_event, id) => {
  const record = activeDownloads.get(id);
  if (record) {
    record.isPaused = true;
    if (record.subprocess && record.subprocess.pid) {
      killProcessTree(record.subprocess.pid);
      record.subprocess = null;
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-progress', {
        id,
        speed: 'Paused',
        eta: '--',
        status: 'paused',
      });
    }
    return { success: true };
  }
  return { success: false, error: 'Download not found or already inactive' };
});

// IPC Handler: Resume Download
ipcMain.handle('resume-download', async (_event, payload) => {
  const id = payload.id;
  const existing = activeDownloads.get(id);
  const downloadPayload = (payload.url && payload.title) ? payload : (existing && existing.payload);
  if (!downloadPayload) {
    return { success: false, error: 'Download details missing' };
  }
  if (existing && existing.subprocess && existing.subprocess.pid) {
    killProcessTree(existing.subprocess.pid);
  }
  return executeDownloadProcess(downloadPayload, true);
});

// IPC Handler: Cancel Download
ipcMain.handle('cancel-download', async (_event, id) => {
  const record = activeDownloads.get(id);
  if (record) {
    record.isCancelled = true;
    if (record.subprocess && record.subprocess.pid) {
      killProcessTree(record.subprocess.pid);
      record.subprocess = null;
    }
    const fileToRemove = record.savedFilePath;
    setTimeout(() => {
      try {
        if (fileToRemove) {
          if (fs.existsSync(fileToRemove)) fs.unlinkSync(fileToRemove);
          const part = `${fileToRemove}.part`;
          if (fs.existsSync(part)) fs.unlinkSync(part);
        }
      } catch (_) {}
    }, 400);

    activeDownloads.delete(id);
    return { success: true };
  }
  return { success: true };
});

// IPC Handler: Open Downloads Folder
ipcMain.handle('open-downloads-folder', async () => {
  const downloadsDir = app.getPath('downloads');
  await shell.openPath(downloadsDir);
  return true;
});

// IPC Handler: Show Item in Folder
ipcMain.handle('show-item-in-folder', async (_event, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
  } else {
    shell.openPath(app.getPath('downloads'));
  }
  return true;
});

// IPC Handler: Get Downloads Path
ipcMain.handle('get-downloads-path', () => {
  return app.getPath('downloads');
});

// IPC Handler: Open External URL safely in default system browser
ipcMain.handle('open-external', async (_event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

// IPC Handler: Get local media streaming URL
ipcMain.handle('get-media-url', async (_event, filePath) => {
  if (!filePath) return '';
  return `http://127.0.0.1:${mediaServerPort}/media?path=${encodeURIComponent(filePath)}`;
});

// IPC Handler: Resolve media file on disk from candidate info
ipcMain.handle('resolve-media-file', async (_event, { filePath, title, resolution, isAudioOnly }) => {
  const downloadsDir = app.getPath('downloads');
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }
  const safeTitle = (title || '')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  const fileTag = isAudioOnly ? 'Audio' : `${resolution || 'Best'}`;
  return resolveDownloadedFilePath(downloadsDir, safeTitle, fileTag, isAudioOnly, filePath);
});

// IPC Handler: Open Native File Dialog to select any video or audio file
ipcMain.handle('open-media-file-dialog', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Video or Audio to Play',
    properties: ['openFile'],
    filters: [
      {
        name: 'All Media Files',
        extensions: ['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'wmv', 'mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'],
      },
      {
        name: 'Video Files (*.mp4, *.mkv, *.webm, *.avi, *.mov)',
        extensions: ['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'wmv'],
      },
      {
        name: 'Audio Files (*.mp3, *.m4a, *.wav, *.aac, *.flac)',
        extensions: ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'],
      },
      { name: 'All Files (*.*)', extensions: ['*'] },
    ],
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  const ext = path.extname(selectedPath).toLowerCase();
  const fileName = path.basename(selectedPath, ext);
  const isAudio = ['.mp3', '.m4a', '.wav', '.aac', '.ogg', '.flac'].includes(ext);

  return {
    filePath: selectedPath,
    title: fileName,
    isAudioOnly: isAudio,
    resolution: isAudio ? 'Audio' : 'Local',
  };
});



