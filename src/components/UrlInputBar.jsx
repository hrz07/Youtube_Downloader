import React, { useState } from 'react';
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ClearIcon from '@mui/icons-material/Clear';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

export default function UrlInputBar({ onAnalyze, loading, t }) {
  const [url, setUrl] = useState('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (url.trim() && !loading) {
      onAnalyze(url.trim());
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          border: (t) => `1px solid ${t.palette.divider}`,
          transition: 'all 0.2s ease-in-out',
          backgroundColor: 'background.paper',
          boxShadow: (t) =>
            t.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 1px 4px rgba(32,33,36,0.08)',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 4px 24px rgba(59,130,246,0.2)'
                : '0 2px 8px rgba(26,115,232,0.12)',
          },
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 4px 28px rgba(59,130,246,0.3)'
                : '0 2px 10px rgba(26,115,232,0.18)',
          },
        }}
      >
        <YouTubeIcon sx={{ color: '#ff0000', fontSize: 32, ml: 1, mr: 1.5 }} />

        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            fontSize: '1rem',
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            color: 'text.primary',
          }}
          placeholder={
            t
              ? t('urlPlaceholder')
              : 'Paste YouTube video link here (e.g., https://www.youtube.com/watch?v=...)'
          }
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          autoFocus
        />

        {url ? (
          <Tooltip title={t ? t('clearTooltip') : 'Clear text'}>
            <IconButton size="small" onClick={handleClear} sx={{ p: '8px', mr: 0.5 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t ? t('pasteTooltip') : 'Paste from clipboard'}>
            <IconButton size="small" onClick={handlePaste} sx={{ p: '8px', mr: 0.5 }}>
              <ContentPasteIcon fontSize="small" sx={{ color: '#5f6368' }} />
            </IconButton>
          </Tooltip>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!url.trim() || loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <PlayCircleOutlineIcon />
            )
          }
          sx={{
            ml: 1,
            px: 3,
            py: 1,
            fontSize: '0.95rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            minWidth: 120,
          }}
        >
          {loading
            ? t
              ? t('analyzingBtn')
              : 'Analyzing...'
            : t
            ? t('analyzeBtn')
            : 'Analyze'}
        </Button>
      </Paper>
    </Box>
  );
}
