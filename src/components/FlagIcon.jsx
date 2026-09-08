import React from 'react';
import { Box } from '@mui/material';

export default function FlagIcon({ code, size = 20, sx = {} }) {
  const flags = {
    // English: United Kingdom Union Flag
    en: (
      <svg width={size} height={(size * 3) / 4} viewBox="0 0 60 45" style={{ borderRadius: '3px', display: 'block' }}>
        <clipPath id="uk-clip">
          <rect width="60" height="45" rx="4" />
        </clipPath>
        <g clipPath="url(#uk-clip)">
          <rect width="60" height="45" fill="#012169" />
          <path d="M0,0 L60,45 M60,0 L0,45" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,45" stroke="#C8102E" strokeWidth="4" strokeDasharray="30 30" strokeDashoffset="0" />
          <path d="M60,0 L0,45" stroke="#C8102E" strokeWidth="4" strokeDasharray="30 30" strokeDashoffset="0" />
          <path d="M30,0 v45 M0,22.5 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v45 M0,22.5 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    ),
    // Bangla: Bangladesh Flag
    bn: (
      <svg width={size} height={(size * 3) / 4} viewBox="0 0 60 45" style={{ borderRadius: '3px', display: 'block' }}>
        <clipPath id="bd-clip">
          <rect width="60" height="45" rx="4" />
        </clipPath>
        <g clipPath="url(#bd-clip)">
          <rect width="60" height="45" fill="#006a4e" />
          <circle cx="27" cy="22.5" r="14" fill="#f42a41" />
        </g>
      </svg>
    ),
    // German: Germany Flag
    de: (
      <svg width={size} height={(size * 3) / 4} viewBox="0 0 60 45" style={{ borderRadius: '3px', display: 'block' }}>
        <clipPath id="de-clip">
          <rect width="60" height="45" rx="4" />
        </clipPath>
        <g clipPath="url(#de-clip)">
          <rect width="60" height="15" y="0" fill="#000000" />
          <rect width="60" height="15" y="15" fill="#dd0000" />
          <rect width="60" height="15" y="30" fill="#ffce00" />
        </g>
      </svg>
    ),
    // Spanish: Spain Flag
    es: (
      <svg width={size} height={(size * 3) / 4} viewBox="0 0 60 45" style={{ borderRadius: '3px', display: 'block' }}>
        <clipPath id="es-clip">
          <rect width="60" height="45" rx="4" />
        </clipPath>
        <g clipPath="url(#es-clip)">
          <rect width="60" height="11.25" y="0" fill="#aa151b" />
          <rect width="60" height="22.5" y="11.25" fill="#f1bf00" />
          <rect width="60" height="11.25" y="33.75" fill="#aa151b" />
          {/* Subtle Coat of Arms indicator */}
          <circle cx="18" cy="22.5" r="4.5" fill="#aa151b" opacity="0.8" />
        </g>
      </svg>
    ),
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        borderRadius: '3px',
        overflow: 'hidden',
        lineHeight: 1,
        ...sx,
      }}
    >
      {flags[code] || null}
    </Box>
  );
}
