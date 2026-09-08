import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
  Switch,
  Divider,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlagIcon from './FlagIcon.jsx';
import { SUPPORTED_LANGUAGES } from '../i18n/translations.js';
import { playDownloadCompleteSound } from '../utils/sound.js';

export default function SettingsModal({
  open,
  onClose,
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  currentLanguage,
  onLanguageChange,
  t,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleTestSound = () => {
    playDownloadCompleteSound();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          background: isDark
            ? 'rgba(21, 28, 46, 0.88)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.6)'}`,
          boxShadow: isDark
            ? '0 20px 45px rgba(0, 0, 0, 0.6)'
            : '0 20px 45px rgba(0, 0, 0, 0.12)',
          p: 1,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.5,
          pb: 1,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <SettingsOutlinedIcon sx={{ color: isDark ? '#60a5fa' : '#1a73e8', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
            {t ? t('settingsTitle') : 'Settings'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1.5 }}>
        {/* Language Setting */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pr: 2 }}>
            <Box
              sx={{
                p: 0.9,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(147, 51, 234, 0.08)',
                color: isDark ? '#c084fc' : '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 0.3,
              }}
            >
              <TranslateIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {t ? t('languageTitle') : 'Language'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                {t ? t('languageDesc') : 'Choose your preferred language'}
              </Typography>
            </Box>
          </Box>

          <Select
            size="small"
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            sx={{
              minWidth: 120,
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.8,
                pr: 3.5,
              },
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlagIcon code={lang.code} size={18} />
                  <span>{lang.nativeName}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />

        {/* Dark Theme Setting */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pr: 2 }}>
            <Box
              sx={{
                p: 0.9,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(26, 115, 232, 0.08)',
                color: isDark ? '#60a5fa' : '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 0.3,
              }}
            >
              <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {t ? t('darkThemeTitle') : 'Dark Theme'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                {t ? t('darkThemeDesc') : 'Sleek dark interface designed for low-light environments'}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={darkMode}
            onChange={(e) => onToggleDarkMode(e.target.checked)}
            color="primary"
          />
        </Box>

        <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />

        {/* Complete Sound Setting */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pr: 2 }}>
            <Box
              sx={{
                p: 0.9,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(30, 142, 62, 0.08)',
                color: isDark ? '#4ade80' : '#1e8e3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 0.3,
              }}
            >
              <VolumeUpOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {t ? t('soundTitle') : 'Completion Sound'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                {t ? t('soundDesc') : 'Play a notification chime when downloads finish'}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={soundEnabled}
            onChange={(e) => onToggleSound(e.target.checked)}
            color="primary"
          />
        </Box>

        {/* Test Sound Button */}
        {soundEnabled && (
          <Box sx={{ pl: 5.5, pt: 0.5, pb: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleTestSound}
              startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '6px',
                fontSize: '0.78rem',
                py: 0.4,
                px: 1.5,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: isDark ? '#60a5fa' : '#1a73e8',
                  backgroundColor: isDark ? 'rgba(96,165,250,0.08)' : 'rgba(26,115,232,0.05)',
                },
              }}
            >
              {t ? t('previewChimeBtn') : 'Preview Chime'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
