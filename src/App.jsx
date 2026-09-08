import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import UrlInputBar from './components/UrlInputBar.jsx';
import VideoPreviewCard from './components/VideoPreviewCard.jsx';
import DownloadQueue from './components/DownloadQueue.jsx';
import HrzLogo from './components/HrzLogo.jsx';
import AboutModal from './components/AboutModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import MediaPlayerModal from './components/MediaPlayerModal.jsx';
import { getAppTheme } from './theme.js';
import { playDownloadCompleteSound } from './utils/sound.js';
import { translations } from './i18n/translations.js';

export default function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedVideo, setAnalyzedVideo] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playingMedia, setPlayingMedia] = useState(null);
  if (typeof window !== 'undefined') {
    window.__testSetDownloads = setDownloads;
    window.__testSetPlayingMedia = setPlayingMedia;
  }

  // Language State with persistent storage
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_dl_language');
      if (saved && translations[saved]) return saved;
      // Auto-detect browser language if supported
      const navLang = navigator.language?.substring(0, 2);
      if (navLang && translations[navLang]) return navLang;
      return 'en';
    } catch {
      return 'en';
    }
  });

  const t = (key) => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    try {
      localStorage.setItem('yt_dl_language', code);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  };

  // Settings State with persistent storage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_dl_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_dl_sound_enabled');
      return saved !== 'false'; // Enabled by default
    } catch {
      return true;
    }
  });

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const currentTheme = useMemo(() => getAppTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  // Dynamically update favicon so it's always bright and visible on both dark and light tabs
  useEffect(() => {
    const targetHref = darkMode ? '/favicon-dark.svg' : '/favicon-light.svg';
    const svgIcon = document.querySelector("link[type='image/svg+xml']");
    if (svgIcon) {
      svgIcon.href = targetHref;
    }
  }, [darkMode]);

  const handleToggleDarkMode = (enabled) => {
    setDarkMode(enabled);
    try {
      localStorage.setItem('yt_dl_dark_mode', String(enabled));
    } catch (e) {
      console.error('Failed to save dark mode preference:', e);
    }
  };

  const handleToggleSound = (enabled) => {
    setSoundEnabled(enabled);
    try {
      localStorage.setItem('yt_dl_sound_enabled', String(enabled));
    } catch (e) {
      console.error('Failed to save sound preference:', e);
    }
  };

  // Setup Electron IPC event listeners
  useEffect(() => {
    if (!window.electronAPI) {
      console.warn('Electron API is not available (running in pure browser mode)');
      return;
    }

    // Progress updates
    const removeProgress = window.electronAPI.onDownloadProgress((data) => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.id !== data.id) return item;
          // Never overwrite a cancelled or completed state
          if (item.status === 'cancelled' || item.status === 'completed') return item;
          // If paused, do not let an in-flight 'downloading' chunk overwrite it
          if (item.status === 'paused' && data.status !== 'paused') return item;

          return {
            ...item,
            progress: data.progress !== undefined ? data.progress : item.progress,
            speed: data.speed !== undefined ? data.speed : item.speed,
            eta: data.eta !== undefined ? data.eta : item.eta,
            totalSize: data.totalSize || item.totalSize,
            status: data.status || item.status,
          };
        })
      );
    });

    // Complete updates
    const removeComplete = window.electronAPI.onDownloadComplete((data) => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.id !== data.id) return item;
          if (item.status === 'cancelled') return item;

          return {
            ...item,
            progress: 100,
            status: 'completed',
            filePath: data.filePath,
            speed: 'Done',
            eta: '00:00',
          };
        })
      );

      // Play completion chime if sound is enabled
      if (soundEnabledRef.current) {
        playDownloadCompleteSound();
      }

      setSnackbar({
        open: true,
        message: t('msgDownloadFinished'),
        severity: 'success',
      });
    });

    // Error updates
    const removeError = window.electronAPI.onDownloadError((data) => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.id !== data.id) return item;
          // If user deliberately cancelled or paused, ignore the exit signal error
          if (item.status === 'cancelled' || item.status === 'paused') return item;

          return {
            ...item,
            status: 'failed',
            error: data.error,
          };
        })
      );
      setSnackbar({
        open: true,
        message: `${t('msgDownloadFailed')}: ${data.error || 'Unknown error'}`,
        severity: 'error',
      });
    });

    return () => {
      removeProgress?.();
      removeComplete?.();
      removeError?.();
    };
  }, [language]);

  const handleAnalyze = async (url) => {
    setAnalyzing(true);
    setAnalyzedVideo(null);

    try {
      if (!window.electronAPI) {
        throw new Error('Electron API contextBridge is not loaded');
      }

      const result = await window.electronAPI.getVideoInfo(url);

      if (result.success && result.data) {
        setAnalyzedVideo(result.data);
        setSnackbar({
          open: true,
          message: t('msgAnalyzed'),
          severity: 'success',
        });
      } else {
        throw new Error(result.error || 'Failed to extract video information.');
      }
    } catch (err) {
      console.error('Analyze error:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Unable to fetch video. Please check URL or network.',
        severity: 'error',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartDownload = async ({ videoInfo, resolution, resolutionLabel, isAudioOnly }) => {
    const downloadId = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newDownload = {
      id: downloadId,
      url: videoInfo.webpageUrl,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      resolution,
      resolutionLabel,
      isAudioOnly,
      progress: 0,
      speed: 'Connecting...',
      eta: 'Estimating...',
      totalSize: 'Calculating...',
      status: 'downloading',
    };

    setDownloads((prev) => [newDownload, ...prev]);

    setSnackbar({
      open: true,
      message: `${t('msgDownloadQueued')}: ${videoInfo.title.substring(0, 40)}...`,
      severity: 'info',
    });

    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.startDownload({
          id: downloadId,
          url: videoInfo.webpageUrl,
          title: videoInfo.title,
          resolution,
          isAudioOnly,
        });
        if (!res.success) {
          throw new Error(res.error || 'Could not start download');
        }
      }
    } catch (err) {
      setDownloads((prev) =>
        prev.map((item) =>
          item.id === downloadId ? { ...item, status: 'failed', error: err.message } : item
        )
      );
      setSnackbar({
        open: true,
        message: `${t('msgDownloadFailed')}: ${err.message}`,
        severity: 'error',
      });
    }
  };

  const handlePauseDownload = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.pauseDownload(id);
    }
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'paused',
              speed: 'Paused',
              eta: '--',
            }
          : item
      )
    );
    setSnackbar({
      open: true,
      message: t('msgDownloadPaused'),
      severity: 'info',
    });
  };

  const handleResumeDownload = async (id) => {
    const item = downloads.find((d) => d.id === id);
    if (!item) return;

    setDownloads((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'downloading',
              speed: 'Resuming...',
              eta: '--',
            }
          : d
      )
    );

    setSnackbar({
      open: true,
      message: t('msgDownloadResumed'),
      severity: 'info',
    });

    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.resumeDownload({
          id: item.id,
          url: item.url,
          title: item.title,
          resolution: item.resolution,
          isAudioOnly: item.isAudioOnly,
        });
        if (!res.success) {
          throw new Error(res.error || 'Failed to resume download');
        }
      }
    } catch (err) {
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'failed', error: err.message } : d
        )
      );
      setSnackbar({
        open: true,
        message: `${t('msgDownloadFailed')}: ${err.message}`,
        severity: 'error',
      });
    }
  };

  const handleCancelDownload = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.cancelDownload(id);
    }
    setDownloads((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'cancelled', speed: '--', eta: '--' } : item
      )
    );
    setSnackbar({
      open: true,
      message: t('msgDownloadCancelled'),
      severity: 'warning',
    });
  };

  const handleShowInFolder = async (filePath) => {
    if (window.electronAPI) {
      await window.electronAPI.showInFolder(filePath);
    }
  };

  const handleOpenFolder = async () => {
    if (window.electronAPI) {
      await window.electronAPI.openDownloadsFolder();
    }
  };

  const handlePlayMedia = async (media) => {
    if (!media) return;
    let finalMedia = { ...media };

    const isDirect =
      typeof media.filePath === 'string' &&
      (media.filePath.startsWith('blob:') ||
        media.filePath.startsWith('http:') ||
        media.filePath.startsWith('https:') ||
        media.filePath.startsWith('data:'));

    if (!isDirect && window.electronAPI?.resolveMediaFile) {
      try {
        const resolved = await window.electronAPI.resolveMediaFile({
          filePath: media.filePath,
          title: media.title,
          resolution: media.resolution,
          isAudioOnly: media.isAudioOnly,
        });
        if (resolved) {
          finalMedia.filePath = resolved;
        }
      } catch (_) {}
    }

    setPlayingMedia(finalMedia);
  };

  const handleClosePlayer = () => {
    setPlayingMedia(null);
  };

  const fileInputRef = useRef(null);

  const handleOpenLocalMedia = async () => {
    if (window.electronAPI?.openMediaFileDialog) {
      try {
        const fileInfo = await window.electronAPI.openMediaFileDialog();
        if (fileInfo && fileInfo.filePath) {
          handlePlayMedia(fileInfo);
          return;
        }
      } catch (err) {
        console.error('[Open Local Media Error]', err);
      }
    }

    // Web / browser fallback: open file dialog via HTML input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleWebFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // In Electron, File objects have a .path property containing the exact disk path
    const filePath = file.path || URL.createObjectURL(file);
    const isAudio =
      file.type.startsWith('audio/') ||
      /\.(mp3|m4a|aac|wav|ogg|flac|wma|opus)$/i.test(file.name);
    handlePlayMedia({
      title: file.name.replace(/\.[^/.]+$/, ''),
      filePath,
      isAudioOnly: isAudio,
      resolution: isAudio ? 'Audio' : 'Local',
    });
  };

  const handleRemoveDownload = (id) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        {/* Navigation Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: (tTheme) => `1px solid ${tTheme.palette.divider}`,
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
            <HrzLogo />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              {/* Play Local Video Button */}
              <Tooltip title={t('btnPlayLocalMedia') || 'Play Local Video'}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VideoLibraryOutlinedIcon sx={{ fontSize: 18 }} />}
                  onClick={handleOpenLocalMedia}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    py: 0.6,
                    px: 1.4,
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.18)' : '#cbd5e1',
                    color: 'text.primary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#60a5fa' : '#2563eb',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(59, 130, 246, 0.12)'
                          : 'rgba(37, 99, 235, 0.06)',
                    },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {t('btnPlayLocalMedia') || 'Play Local Video'}
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    Play
                  </Box>
                </Button>
              </Tooltip>

              {/* Settings Button */}
              <Tooltip title={t('settingsTooltip')}>
                <IconButton
                  onClick={() => setSettingsOpen(true)}
                  sx={{
                    color: 'text.secondary',
                    borderRadius: '8px',
                    p: 0.9,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                      color: 'text.primary',
                    },
                  }}
                >
                  <SettingsOutlinedIcon sx={{ fontSize: 21 }} />
                </IconButton>
              </Tooltip>

              {/* About Button */}
              <Tooltip title={t('aboutTooltip')}>
                <IconButton
                  onClick={() => setAboutOpen(true)}
                  sx={{
                    color: 'text.secondary',
                    borderRadius: '8px',
                    p: 0.9,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                      color: 'text.primary',
                    },
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 21 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.5px',
                mb: 1,
              }}
            >
              {t('heroTitle')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              {t('heroSubtitle')}
            </Typography>
          </Box>

          {/* URL Input Bar */}
          <UrlInputBar onAnalyze={handleAnalyze} loading={analyzing} t={t} />

          {/* Video Preview Card (shown after analysis) */}
          {analyzedVideo && (
            <VideoPreviewCard
              videoInfo={analyzedVideo}
              onStartDownload={handleStartDownload}
              t={t}
            />
          )}

          {/* Download Queue */}
          <Box sx={{ mt: analyzedVideo ? 1 : 2, flex: 1 }}>
            <DownloadQueue
              downloads={downloads}
              onPlayMedia={handlePlayMedia}
              onPauseDownload={handlePauseDownload}
              onResumeDownload={handleResumeDownload}
              onCancelDownload={handleCancelDownload}
              onShowInFolder={handleShowInFolder}
              onRemoveDownload={handleRemoveDownload}
              onOpenFolder={handleOpenFolder}
              onPlayLocalFile={handleOpenLocalMedia}
              t={t}
            />
          </Box>
        </Container>

        {/* Snackbar feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: '6px', fontWeight: 500 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Settings Modal */}
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          t={t}
        />

        {/* Glassmorphism About Modal */}
        <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} t={t} />

        {/* In-App Media Player Modal */}
        <MediaPlayerModal
          open={Boolean(playingMedia)}
          media={playingMedia}
          onClose={handleClosePlayer}
          onShowInFolder={handleShowInFolder}
          t={t}
        />

        {/* Hidden File Picker Input for fallback / browser mode */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleWebFileSelect}
          accept="video/*,audio/*,.mkv,.avi"
          style={{ display: 'none' }}
        />
      </Box>
    </ThemeProvider>
  );
}
