import React from 'react';
import { Box, Typography } from '@mui/material';

export default function HrzLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, userSelect: 'none' }}>
      {/* Minimal Bird Vector Mark */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.primary',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <svg
          width="32"
          height="36"
          viewBox="0 0 36 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bird Body & Head with Leaf Wing Cutout */}
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

          {/* Standing Leg & Base Line */}
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

          {/* Bent Leg (forming the geometric 4 shape) */}
          <polyline
            points="16.2,24.5 13.2,30.5 18.5,30.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>

      {/* Minimal Brand Title */}
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: '1.12rem',
          letterSpacing: '-0.3px',
          color: 'text.primary',
          fontFamily: '"Google Sans", "Roboto", -apple-system, sans-serif',
        }}
      >
        YouTube Downloader
      </Typography>
    </Box>
  );
}
