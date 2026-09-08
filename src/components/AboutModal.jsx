import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function AboutModal({ open, onClose, t }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleOpenLink = (e, url) => {
    if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
      e?.preventDefault?.();
      window.electronAPI.openExternal(url);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(15, 23, 42, 0.25)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '14px',
          backgroundColor: isDark ? 'rgba(21, 28, 46, 0.92)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isDark
            ? '0 24px 48px rgba(0, 0, 0, 0.6)'
            : '0 24px 48px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          p: 0,
        },
      }}
    >
      {/* Top Bar with Close Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1.5,
          pb: 0,
        }}
      >
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ textAlign: 'center', px: 3.5, pb: 4, pt: 0.5 }}>
        {/* Bird Logo in Circle */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(241, 245, 249, 0.85)',
            border: isDark ? '1px solid rgba(51, 65, 85, 0.9)' : '1px solid rgba(226, 232, 240, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            color: 'text.primary',
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <svg
            width="34"
            height="38"
            viewBox="0 0 36 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 18.2 7.2
                 C 17.2 6 15 5.5 13.8 6
                 C 15.8 7.5 17 8.8 18.2 10.2
                 L 29.8 10.8
                 C 25.2 11.5 22.4 12.6 21 14.2
                 C 19.8 15.5 20.2 17.8 19.5 19.8
                 C 18.8 21.6 17.4 22.8 15.6 23.5
                 L 15 23.6
                 C 11.2 25.4 7.6 27.8 4.5 29
                 C 8 25.4 11.2 21.2 12.6 17.2
                 C 13.8 14 15 11.2 17 9.2
                 C 17.6 8.5 18 7.8 18.2 7.2
                 Z
                 M 14 15.8
                 C 15.8 13.4 19.2 14.2 18.8 17
                 C 18.4 19.5 16.4 22 14.6 23.2
                 C 13.6 21.2 13 18 14 15.8
                 Z"
              fill="currentColor"
            />
            <line
              x1="16.2"
              y1="23.5"
              x2="16.2"
              y2="36"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="13.2"
              y1="36"
              x2="19.2"
              y2="36"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <polyline
              points="16.2,24.5 13.2,30.5 18.5,30.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>

        {/* Title & Version */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'text.primary',
            letterSpacing: '-0.3px',
            mb: 0.5,
          }}
        >
          {t ? t('aboutTitle') : 'YouTube Downloader'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
          <Chip
            size="small"
            label="v1.0.0"
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#e8f0fe',
              color: isDark ? '#60a5fa' : '#1a73e8',
              borderRadius: '4px',
            }}
          />
          <Chip
            size="small"
            label={t ? t('aboutSubtitle') : 'Desktop Edition'}
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 500,
              backgroundColor: isDark ? 'rgba(51, 65, 85, 0.4)' : '#f1f5f9',
              color: 'text.secondary',
              borderRadius: '4px',
            }}
          />
        </Box>

        <Divider sx={{ mb: 2.5, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.7)' }} />

        {/* Developer & App Info Cards */}
        <Box
          sx={{
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
            border: isDark ? '1px solid rgba(51, 65, 85, 0.6)' : '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '10px',
            p: 2,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Developer Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.7)' : '#ffffff',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0a66c2',
                flexShrink: 0,
              }}
            >
              <PersonOutlineIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.2 }}>
                {t ? t('developerLabel') : 'Developer'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                <Tooltip title="View LinkedIn Profile">
                  <Typography
                    component="a"
                    href="https://www.linkedin.com/in/hridoooy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    onClick={(e) => handleOpenLink(e, 'https://www.linkedin.com/in/hridoooy/')}
                    sx={{
                      color: 'text.primary',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: '#0a66c2',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Rashedul Islam Hridoy
                  </Typography>
                </Tooltip>

                <Tooltip title="View GitHub Profile">
                  <Typography
                    component="a"
                    href="https://github.com/hrz07"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    onClick={(e) => handleOpenLink(e, 'https://github.com/hrz07')}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: 'text.primary',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    (Hrz07)
                  </Typography>
                </Tooltip>
              </Box>
            </Box>

            {/* Social Action Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <Tooltip title="Open LinkedIn (https://www.linkedin.com/in/hridoooy/)">
                <IconButton
                  component="a"
                  href="https://www.linkedin.com/in/hridoooy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  onClick={(e) => handleOpenLink(e, 'https://www.linkedin.com/in/hridoooy/')}
                  sx={{
                    color: '#0a66c2',
                    p: 0.6,
                    '&:hover': { backgroundColor: 'rgba(10, 102, 194, 0.12)' },
                  }}
                >
                  <LinkedInIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Open GitHub (https://github.com/hrz07)">
                <IconButton
                  component="a"
                  href="https://github.com/hrz07"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  onClick={(e) => handleOpenLink(e, 'https://github.com/hrz07')}
                  sx={{
                    color: 'text.secondary',
                    p: 0.6,
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      color: 'text.primary',
                    },
                  }}
                >
                  <GitHubIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Engine Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.7)' : '#ffffff',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#34d399' : '#059669',
                flexShrink: 0,
              }}
            >
              <CodeIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block' }}>
                {t ? t('engineLabel') : 'Engine'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                yt-dlp & FFmpeg
              </Typography>
            </Box>
          </Box>

          {/* Tech Stack Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(51, 65, 85, 0.7)' : '#ffffff',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#a78bfa' : '#7c3aed',
                flexShrink: 0,
              }}
            >
              <LayersOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block' }}>
                {t ? t('frameworkLabel') : 'Framework'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Electron • React • Material-UI
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
