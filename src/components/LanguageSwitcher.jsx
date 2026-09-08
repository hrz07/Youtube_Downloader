import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  useTheme,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FlagIcon from './FlagIcon.jsx';
import { SUPPORTED_LANGUAGES } from '../i18n/translations.js';

export default function LanguageSwitcher({ currentLanguage, onLanguageChange, t }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code) => {
    onLanguageChange(code);
    handleClose();
  };

  const activeLang =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <Tooltip title={t ? t('languageTooltip') : 'Change Language'}>
        <Button
          onClick={handleClick}
          size="small"
          startIcon={<FlagIcon code={activeLang.code} size={18} />}
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '18px !important', ml: -0.5, color: 'text.secondary' }} />}
          sx={{
            borderRadius: '8px',
            px: 1.2,
            py: 0.6,
            minWidth: 'auto',
            color: 'text.primary',
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${theme.palette.divider}`,
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
            },
          }}
        >
          {activeLang.nativeName}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 190,
            borderRadius: '12px',
            backgroundColor: isDark ? 'rgba(21, 28, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: isDark
              ? '0 12px 32px rgba(0, 0, 0, 0.6)'
              : '0 12px 32px rgba(0, 0, 0, 0.12)',
            p: 0.5,
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 0.8, borderBottom: `1px solid ${theme.palette.divider}`, mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t ? t('languageTitle') : 'Language'}
          </Typography>
        </Box>

        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLanguage;
          return (
            <MenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              selected={isSelected}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 1.5,
                my: 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isSelected
                  ? isDark
                    ? 'rgba(59, 130, 246, 0.15) !important'
                    : 'rgba(26, 115, 232, 0.08) !important'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FlagIcon code={lang.code} size={22} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500, color: 'text.primary' }}>
                    {lang.nativeName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                    {lang.name}
                  </Typography>
                </Box>
              </Box>

              {isSelected && (
                <CheckIcon sx={{ fontSize: 18, color: isDark ? '#60a5fa' : '#1a73e8' }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
