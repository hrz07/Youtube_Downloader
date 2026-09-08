import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Fade,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Format duration seconds to HH:MM:SS or MM:SS
function formatDuration(sec) {
  if (!sec) return '00:00';
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function VideoPreviewCard({ videoInfo, onStartDownload, t }) {
  if (!videoInfo) return null;

  const { title, channel, duration, thumbnail, resolutions = [], webpageUrl } = videoInfo;

  // Default to 1080p if available, else first option
  const [selectedResolution, setSelectedResolution] = useState('');

  useEffect(() => {
    if (resolutions.length > 0) {
      const defaultOption =
        resolutions.find((r) => r.resolution === '1080') ||
        resolutions.find((r) => r.type === 'video') ||
        resolutions[0];
      setSelectedResolution(defaultOption.resolution);
    }
  }, [resolutions]);

  const handleDownloadClick = () => {
    const selectedObj = resolutions.find((r) => r.resolution === selectedResolution);
    const isAudioOnly = selectedObj?.type === 'audio' || selectedResolution === 'audio_only';

    onStartDownload({
      videoInfo,
      resolution: selectedResolution,
      resolutionLabel: selectedObj?.label || selectedResolution,
      isAudioOnly,
    });
  };

  const currentOption = resolutions.find((r) => r.resolution === selectedResolution);

  return (
    <Fade in={Boolean(videoInfo)} timeout={400}>
      <Card
        sx={{
          mb: 3,
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: (t) =>
            t.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 1px 3px rgba(60,64,67,0.1), 0 2px 8px rgba(60,64,67,0.06)',
          border: (t) => `1px solid ${t.palette.divider}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 6px 24px rgba(0,0,0,0.6)'
                : '0 2px 8px rgba(60,64,67,0.14), 0 4px 14px rgba(60,64,67,0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Thumbnail Container */}
          <Box
            sx={{
              position: 'relative',
              width: { xs: '100%', md: 360 },
              minHeight: 200,
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {thumbnail ? (
              <Box
                component="img"
                src={thumbnail}
                alt={title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: '#80868b' }}>
                No preview available
              </Typography>
            )}

            {/* Duration Tag */}
            {duration > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: '#ffffff',
                  px: 0.8,
                  py: 0.2,
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 13 }} />
                {formatDuration(duration)}
              </Box>
            )}
          </Box>

          {/* Content & Actions */}
          <CardContent
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
            }}
          >
            <Box>
              {/* Channel / Source */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountCircleIcon sx={{ fontSize: 18, color: '#5f6368' }} />
                <Typography variant="body2" sx={{ color: '#5f6368', fontWeight: 500 }}>
                  {channel}
                </Typography>
                <Chip
                  size="small"
                  label={t ? t('verifiedSource') : 'Verified Source'}
                  color="success"
                  variant="outlined"
                  icon={<CheckCircleOutlineIcon style={{ fontSize: 14 }} />}
                  sx={{ height: 22, fontSize: '0.7rem', ml: 'auto' }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.35,
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </Typography>
            </Box>

            <Divider sx={{ my: 1.5, borderColor: (t) => t.palette.divider }} />

            {/* Resolution Selector & Download CTA */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                mt: 1,
              }}
            >
              <Box sx={{ minWidth: 260, flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', mb: 0.5, display: 'block' }}
                >
                  {t ? t('selectQuality') : 'Select Quality / Format:'}
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedResolution}
                    onChange={(e) => setSelectedResolution(e.target.value)}
                    sx={{
                      borderRadius: '6px',
                      backgroundColor: (t) => t.palette.mode === 'dark' ? '#1c253b' : '#f8fafd',
                      '& .MuiSelect-select': {
                        py: 1.1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      },
                    }}
                  >
                    {resolutions.map((res) => (
                      <MenuItem key={res.resolution} value={res.resolution}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {res.type === 'audio' ? (
                            <MusicNoteIcon fontSize="small" sx={{ color: '#188038' }} />
                          ) : (
                            <HighQualityIcon
                              fontSize="small"
                              sx={{
                                color:
                                  res.height >= 1440
                                    ? '#d93025'
                                    : res.height >= 1080
                                    ? '#1a73e8'
                                    : '#5f6368',
                              }}
                            />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {res.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleDownloadClick}
                startIcon={<DownloadIcon />}
                sx={{
                  px: 3.5,
                  py: 1.1,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(26,115,232,0.3)',
                  alignSelf: { xs: 'stretch', sm: 'flex-end' },
                }}
              >
                {t ? t('downloadNow') : 'Download Now'}
              </Button>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Fade>
  );
}
