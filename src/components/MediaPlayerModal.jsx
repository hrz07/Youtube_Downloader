import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  useTheme,
  Alert,
  Slider,
  Menu,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import Replay10RoundedIcon from '@mui/icons-material/Replay10Rounded';
import Forward10RoundedIcon from '@mui/icons-material/Forward10Rounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${mins}:${pad(secs)}`;
}

export default function MediaPlayerModal({ open, media, onClose, onShowInFolder, t }) {
  const theme = useTheme();
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const videoContainerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const clickTimerRef = useRef(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekSliderVal, setSeekSliderVal] = useState(0);

  // UI state
  const [loadError, setLoadError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splashIcon, setSplashIcon] = useState(null);
  const [speedMenuAnchor, setSpeedMenuAnchor] = useState(null);
  const [volumeHover, setVolumeHover] = useState(false);

  const isAudio = Boolean(media?.isAudioOnly);

  const isDirectUrl = (url) =>
    Boolean(
      typeof url === 'string' &&
        (url.startsWith('blob:') ||
          url.startsWith('http:') ||
          url.startsWith('https:') ||
          url.startsWith('data:') ||
          url.startsWith('atom:') ||
          url.startsWith('media:'))
    );

  const [streamUrl, setStreamUrl] = useState(() => {
    if (!media?.filePath) return '';
    if (isDirectUrl(media.filePath)) {
      return media.filePath;
    }
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      const titleParam = media.title ? `&title=${encodeURIComponent(media.title)}` : '';
      return `/api/media-stream?path=${encodeURIComponent(media.filePath)}${titleParam}`;
    }
    return `file:///${media.filePath.replace(/\\/g, '/')}`;
  });

  useEffect(() => {
    setLoadError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedPercent(0);

    if (!media?.filePath) {
      setStreamUrl('');
      return;
    }

    if (isDirectUrl(media.filePath)) {
      setStreamUrl(media.filePath);
      return;
    }

    if (window.location.protocol.startsWith('http')) {
      const titleParam = media.title ? `&title=${encodeURIComponent(media.title)}` : '';
      setStreamUrl(`/api/media-stream?path=${encodeURIComponent(media.filePath)}${titleParam}`);
      return;
    }

    if (window.electronAPI?.getMediaUrl) {
      window.electronAPI
        .getMediaUrl(media.filePath)
        .then((url) => {
          if (url) setStreamUrl(url);
        })
        .catch(() => {
          const fallback = window.electronAPI?.getFileUrl
            ? window.electronAPI.getFileUrl(media.filePath)
            : `file:///${media.filePath.replace(/\\/g, '/')}`;
          setStreamUrl(fallback);
        });
      return;
    }

    if (window.electronAPI?.getFileUrl) {
      setStreamUrl(window.electronAPI.getFileUrl(media.filePath));
      return;
    }

    setStreamUrl(`file:///${media.filePath.replace(/\\/g, '/')}`);
  }, [media]);

  // Track browser fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controls auto-hide on mouse inactivity
  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
      }
    }, 2800);
  }, []);

  const triggerSplash = (type) => {
    setSplashIcon(type);
    setTimeout(() => {
      setSplashIcon(null);
    }, 450);
  };

  // Play / Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      triggerSplash('play');
    } else {
      video.pause();
      triggerSplash('pause');
    }
    showControlsTemporarily();
  };

  // Fullscreen toggle
  const handleToggleFullscreen = async () => {
    if (!videoContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {}
  };

  // Handle single vs double click on video
  const handleVideoClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      handleToggleFullscreen();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        togglePlayPause();
      }, 250);
    }
  };

  // Skip relative seconds (+10s, -10s)
  const handleSkip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    video.currentTime = target;
    setCurrentTime(target);
    showControlsTemporarily();
  };

  // Seekbar handlers
  const handleSeekChange = (_, value) => {
    setIsSeeking(true);
    setSeekSliderVal(value);
  };

  const handleSeekCommit = (_, value) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = value;
      setCurrentTime(value);
    }
    setIsSeeking(false);
    showControlsTemporarily();
  };

  // Volume & mute handlers
  const handleVolumeChange = (_, value) => {
    const video = videoRef.current;
    setVolume(value);
    setIsMuted(value === 0);
    if (video) {
      video.volume = value;
      video.muted = value === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      const restoreVol = volume > 0 ? volume : 0.5;
      video.muted = false;
      video.volume = restoreVol;
      setIsMuted(false);
      setVolume(restoreVol);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Picture in Picture
  const handleTogglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  // Playback speed
  const handleSelectSpeed = (speed) => {
    const video = videoRef.current;
    setPlaybackRate(speed);
    if (video) video.playbackRate = speed;
    setSpeedMenuAnchor(null);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const video = isAudio ? audioRef.current : videoRef.current;
      if (!video) return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        handleSkip(-10);
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(null, Math.min(1, volume + 0.1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(null, Math.max(0, volume - 0.1));
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isAudio, volume, isMuted]);

  if (!open || !media) return null;

  const displayTime = isSeeking ? seekSliderVal : currentTime;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isFullscreen ? 0 : '20px',
          overflow: 'hidden',
          backgroundColor: '#000000',
          border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isAudio ? 260 : 420,
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseMove={showControlsTemporarily}
        onMouseEnter={showControlsTemporarily}
        onMouseLeave={() => {
          if (videoRef.current && !videoRef.current.paused) {
            setControlsVisible(false);
          }
        }}
      >
        {/* Minimal Apple-Style Floating Top HUD (Auto-Hides) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            px: 2.5,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            background: isAudio
              ? 'transparent'
              : 'linear-gradient(180deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.25) 60%, transparent 100%)',
            pointerEvents: controlsVisible ? 'auto' : 'none',
            opacity: controlsVisible ? 1 : 0,
            transform: controlsVisible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
          }}
        >
          {/* Left: Video title with Apple-style rounded pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              {media.title || 'Playing Media'}
            </Typography>

            {media.resolution && (
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  flexShrink: 0,
                  letterSpacing: '0.04em',
                }}
              >
                {media.resolution}
              </Box>
            )}

            {isAudio && (
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(74, 222, 128, 0.2)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(74, 222, 128, 0.35)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#4ade80',
                  flexShrink: 0,
                }}
              >
                {t ? t('audioTrack') : 'Audio'}
              </Box>
            )}
          </Box>

          {/* Right: Circular Translucent Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {media.filePath && !media.filePath.startsWith('blob:') && onShowInFolder && (
              <Tooltip title={t ? t('actionShowFolder') : 'Show in folder'}>
                <IconButton
                  size="small"
                  onClick={() => onShowInFolder(media.filePath)}
                  sx={{
                    width: 32,
                    height: 32,
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.28)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <FolderOpenIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Close (Esc)">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  width: 32,
                  height: 32,
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                    borderColor: 'rgba(239, 68, 68, 0.95)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loadError ? (
          <Box sx={{ p: 4, width: '100%', maxWidth: 480, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t ? t('fileNotFound') : 'Media file could not be found on disk.'}
            </Alert>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              {media.filePath}
            </Typography>
            {media.filePath && !media.filePath.startsWith('blob:') && onShowInFolder && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderOpenIcon />}
                onClick={() => onShowInFolder(media.filePath)}
              >
                {t ? t('openFolderBtn') : 'Downloads Folder'}
              </Button>
            )}
          </Box>
        ) : isAudio ? (
          /* Apple Music-Style Audio Player Layout */
          <Box
            sx={{
              width: '100%',
              pt: 7,
              pb: 4,
              px: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2.5,
              background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.7) 0%, rgba(10, 15, 25, 0.95) 100%)',
            }}
          >
            {media.thumbnail ? (
              <Box
                component="img"
                src={media.thumbnail}
                alt=""
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.15)',
                  animation: isPlaying ? 'spin 20s linear infinite' : 'none',
                  '@keyframes spin': {
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(74, 222, 128, 0.15)',
                  color: '#4ade80',
                  boxShadow: '0 0 30px rgba(74, 222, 128, 0.3)',
                }}
              >
                <VolumeUpRoundedIcon sx={{ fontSize: 48 }} />
              </Box>
            )}

            <Box sx={{ textAlign: 'center', maxWidth: 440 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {media.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {t ? t('audioTrack') : 'High-Quality Audio'}
              </Typography>
            </Box>

            <Box sx={{ width: '100%', maxWidth: 460 }}>
              <audio
                ref={audioRef}
                src={streamUrl}
                controls
                autoPlay
                style={{ width: '100%' }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error('[Audio load error]', e.nativeEvent, streamUrl);
                  setLoadError(true);
                }}
              />
            </Box>
          </Box>
        ) : (
          /* Edge-to-Edge Native Video with Edge-to-Edge Cinema Controls */
          <Box
            ref={videoContainerRef}
            sx={{
              width: '100%',
              height: isFullscreen ? '100vh !important' : 'auto',
              maxWidth: isFullscreen ? '100vw !important' : '100%',
              maxHeight: isFullscreen ? '100vh !important' : '75vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000000',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: isFullscreen ? '0 !important' : '20px',
              cursor: controlsVisible ? 'default' : 'none',
              '&:fullscreen, &:-webkit-full-screen': {
                width: '100vw !important',
                height: '100vh !important',
                maxWidth: '100vw !important',
                maxHeight: '100vh !important',
                borderRadius: '0 !important',
              },
            }}
          >
            {/* The Video Element - Native 1:1 Pixel Fidelity Hardware Accelerated */}
            <video
              ref={videoRef}
              src={streamUrl}
              autoPlay
              playsInline
              onClick={handleVideoClick}
              onPlay={() => {
                setIsPlaying(true);
                showControlsTemporarily();
              }}
              onPause={() => {
                setIsPlaying(false);
                setControlsVisible(true);
              }}
              onTimeUpdate={() => {
                const video = videoRef.current;
                if (!video || isSeeking) return;
                setCurrentTime(video.currentTime);
              }}
              onSeeked={() => {
                const video = videoRef.current;
                if (video) setCurrentTime(video.currentTime);
              }}
              onLoadedMetadata={() => {
                const video = videoRef.current;
                if (video) {
                  setDuration(video.duration || 0);
                  video.volume = volume;
                  video.muted = isMuted;
                  video.playbackRate = playbackRate;
                }
              }}
              onDurationChange={() => {
                const video = videoRef.current;
                if (video && video.duration) {
                  setDuration(video.duration);
                }
              }}
              onProgress={() => {
                const video = videoRef.current;
                if (video && video.buffered.length > 0 && video.duration) {
                  const end = video.buffered.end(video.buffered.length - 1);
                  setBufferedPercent((end / video.duration) * 100);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                setControlsVisible(true);
              }}
              onError={(e) => {
                console.error('[Video load error]', e.nativeEvent, streamUrl);
                setLoadError(true);
              }}
              style={{
                width: '100%',
                height: isFullscreen ? '100vh' : 'auto',
                maxWidth: '100%',
                maxHeight: isFullscreen ? '100vh' : '75vh',
                objectFit: 'contain',
                display: 'block',
                outline: 'none',
                backgroundColor: '#000000',
              }}
            />

            {/* Central Ripple Splash on Play/Pause */}
            {splashIcon && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  pointerEvents: 'none',
                  animation: 'splashAnim 0.4s ease-out forwards',
                  zIndex: 25,
                  '@keyframes splashAnim': {
                    '0%': { transform: 'translate(-50%, -50%) scale(0.75)', opacity: 0 },
                    '50%': { transform: 'translate(-50%, -50%) scale(1.08)', opacity: 1 },
                    '100%': { transform: 'translate(-50%, -50%) scale(1.25)', opacity: 0 },
                  },
                }}
              >
                {splashIcon === 'play' ? (
                  <PlayArrowRoundedIcon sx={{ fontSize: 44 }} />
                ) : (
                  <PauseRoundedIcon sx={{ fontSize: 44 }} />
                )}
              </Box>
            )}

            {/* Previous-Style Edge-to-Edge Full-Width Cinema Controls Bar */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 30,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.55) 30%, rgba(0, 0, 0, 0.92) 100%)',
                px: isFullscreen ? 3 : 2,
                pb: isFullscreen ? 2 : 1.25,
                pt: 3.5,
                display: 'flex',
                flexDirection: 'column',
                opacity: controlsVisible ? 1 : 0,
                pointerEvents: controlsVisible ? 'auto' : 'none',
                transition: 'opacity 0.25s ease',
              }}
              onMouseEnter={() => {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
              }}
            >
              {/* Full-Width Edge-to-Edge Seek Slider with Buffer Indicator */}
              <Box sx={{ position: 'relative', width: '100%', px: 0, mb: 0.5 }}>
                {/* Buffered Track Bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    height: 4,
                    width: `${bufferedPercent}%`,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    transition: 'width 0.2s ease',
                  }}
                />
                <Slider
                  size="small"
                  value={displayTime}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onChange={handleSeekChange}
                  onChangeCommitted={handleSeekCommit}
                  sx={{
                    height: 4,
                    p: '8px 0',
                    transition: 'height 0.15s ease',
                    '&:hover': {
                      height: 6,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      opacity: 1,
                      borderRadius: '3px',
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #ff007a 0%, #ec4899 25%, #a855f7 55%, #3b82f6 80%, #06b6d4 100%) !important',
                      border: 'none',
                      borderRadius: '3px',
                      boxShadow: '0 0 10px rgba(255, 0, 122, 0.6), 0 0 18px rgba(168, 85, 247, 0.45)',
                    },
                    '& .MuiSlider-thumb': {
                      width: 14,
                      height: 14,
                      backgroundColor: '#ffffff',
                      border: '2px solid rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 0 10px rgba(255, 0, 122, 0.85), 0 0 20px rgba(6, 182, 212, 0.75), 0 2px 8px rgba(0, 0, 0, 0.7)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      '&:hover, &.Mui-focusVisible, &.Mui-active': {
                        transform: 'scale(1.4)',
                        boxShadow: '0 0 16px rgba(255, 0, 122, 1), 0 0 28px rgba(168, 85, 247, 0.9), 0 0 40px rgba(6, 182, 212, 0.85)',
                      },
                    },
                  }}
                />
              </Box>

              {/* Bottom Controls Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                {/* Left: Play/Pause, Volume, Time */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Play / Pause Flat Icon Button */}
                  <IconButton
                    size="small"
                    onClick={togglePlayPause}
                    sx={{
                      color: '#ffffff',
                      p: 0.75,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        transform: 'scale(1.15)',
                        color: '#38bdf8',
                      },
                    }}
                  >
                    {isPlaying ? (
                      <PauseRoundedIcon sx={{ fontSize: 24 }} />
                    ) : (
                      <PlayArrowRoundedIcon sx={{ fontSize: 24 }} />
                    )}
                  </IconButton>

                  {/* Volume with Smooth Expand Slider */}
                  <Box
                    onMouseEnter={() => setVolumeHover(true)}
                    onMouseLeave={() => setVolumeHover(false)}
                    sx={{ display: 'flex', alignItems: 'center', ml: 0.25 }}
                  >
                    <IconButton
                      size="small"
                      onClick={toggleMute}
                      sx={{
                        color: '#ffffff',
                        p: 0.75,
                        transition: 'all 0.15s ease',
                        '&:hover': { transform: 'scale(1.15)' },
                      }}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeOffRoundedIcon sx={{ fontSize: 21 }} />
                      ) : volume < 0.5 ? (
                        <VolumeDownRoundedIcon sx={{ fontSize: 21 }} />
                      ) : (
                        <VolumeUpRoundedIcon sx={{ fontSize: 21 }} />
                      )}
                    </IconButton>

                    <Box
                      sx={{
                        width: volumeHover ? 64 : 0,
                        opacity: volumeHover ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'width 0.22s ease, opacity 0.22s ease',
                        display: 'flex',
                        alignItems: 'center',
                        pl: volumeHover ? 0.75 : 0,
                      }}
                    >
                      <Slider
                        size="small"
                        value={isMuted ? 0 : volume}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={handleVolumeChange}
                        sx={{
                          color: '#ffffff',
                          height: 3,
                          '& .MuiSlider-thumb': {
                            width: 10,
                            height: 10,
                            backgroundColor: '#ffffff',
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Time Display (Clean Cinema Font) */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#ffffff',
                      fontFamily: 'ui-sans-serif, system-ui, -apple-system, Roboto, sans-serif',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      pl: 1,
                      userSelect: 'none',
                    }}
                  >
                    {formatTime(displayTime)}
                    <Box component="span" sx={{ opacity: 0.45, mx: 0.6 }}>
                      /
                    </Box>
                    {formatTime(duration)}
                  </Typography>
                </Box>

                {/* Right: Skips, Speed, PiP, Fullscreen */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Rewind 10s */}
                  <Tooltip title="Rewind 10s (←)">
                    <IconButton
                      size="small"
                      onClick={() => handleSkip(-10)}
                      sx={{
                        color: '#ffffff',
                        p: 0.75,
                        opacity: 0.85,
                        transition: 'all 0.15s ease',
                        '&:hover': { opacity: 1, transform: 'scale(1.15)' },
                      }}
                    >
                      <Replay10RoundedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Forward 10s */}
                  <Tooltip title="Forward 10s (→)">
                    <IconButton
                      size="small"
                      onClick={() => handleSkip(10)}
                      sx={{
                        color: '#ffffff',
                        p: 0.75,
                        opacity: 0.85,
                        transition: 'all 0.15s ease',
                        '&:hover': { opacity: 1, transform: 'scale(1.15)' },
                      }}
                    >
                      <Forward10RoundedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Playback Speed Button with Red Pill Badge */}
                  <Tooltip title="Playback Speed">
                    <IconButton
                      size="small"
                      onClick={(e) => setSpeedMenuAnchor(e.currentTarget)}
                      sx={{
                        color: '#ffffff',
                        p: 0.75,
                        position: 'relative',
                        opacity: 0.85,
                        transition: 'all 0.15s ease',
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <SpeedRoundedIcon sx={{ fontSize: 21 }} />
                      <Box
                        component="span"
                        sx={{
                          position: 'absolute',
                          top: 3,
                          right: 1,
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontSize: '8.5px',
                          fontWeight: 700,
                          lineHeight: 1,
                          px: '3px',
                          py: '1.5px',
                          borderRadius: '3px',
                        }}
                      >
                        {playbackRate}x
                      </Box>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={speedMenuAnchor}
                    open={Boolean(speedMenuAnchor)}
                    onClose={() => setSpeedMenuAnchor(null)}
                    PaperProps={{
                      sx: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '14px',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                        color: '#ffffff',
                        minWidth: 100,
                      },
                    }}
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <MenuItem
                        key={rate}
                        selected={playbackRate === rate}
                        onClick={() => handleSelectSpeed(rate)}
                        sx={{
                          fontSize: '0.82rem',
                          fontWeight: playbackRate === rate ? 700 : 500,
                          color: playbackRate === rate ? '#38bdf8' : '#ffffff',
                          borderRadius: '8px',
                          mx: 0.5,
                          my: 0.2,
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(56, 189, 248, 0.16)',
                          },
                        }}
                      >
                        {rate}x {rate === 1 && '(Normal)'}
                      </MenuItem>
                    ))}
                  </Menu>

                  {/* Picture in Picture */}
                  {document.pictureInPictureEnabled && (
                    <Tooltip title="Picture-in-Picture">
                      <IconButton
                        size="small"
                        onClick={handleTogglePiP}
                        sx={{
                          color: '#ffffff',
                          p: 0.75,
                          opacity: 0.85,
                          transition: 'all 0.15s ease',
                          '&:hover': { opacity: 1, transform: 'scale(1.15)' },
                        }}
                      >
                        <PictureInPictureAltRoundedIcon sx={{ fontSize: 19 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Fullscreen Toggle */}
                  <Tooltip title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}>
                    <IconButton
                      size="small"
                      onClick={handleToggleFullscreen}
                      sx={{
                        color: '#ffffff',
                        p: 0.75,
                        opacity: 0.85,
                        transition: 'all 0.15s ease',
                        '&:hover': { opacity: 1, transform: 'scale(1.15)' },
                      }}
                    >
                      {isFullscreen ? (
                        <FullscreenExitRoundedIcon sx={{ fontSize: 23 }} />
                      ) : (
                        <FullscreenRoundedIcon sx={{ fontSize: 23 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
