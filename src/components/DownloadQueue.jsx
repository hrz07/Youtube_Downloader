import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  Button,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';

export default function DownloadQueue({
  downloads,
  onPlayMedia,
  onPauseDownload,
  onResumeDownload,
  onCancelDownload,
  onShowInFolder,
  onRemoveDownload,
  onOpenFolder,
  onPlayLocalFile,
  t,
}) {
  const [currentTab, setCurrentTab] = useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const filteredDownloads = downloads.filter((item) => {
    if (currentTab === 1)
      return item.status === 'downloading' || item.status === 'merging' || item.status === 'paused';
    if (currentTab === 2) return item.status === 'completed';
    if (currentTab === 3) return item.status === 'cancelled' || item.status === 'failed';
    return true; // Tab 0 is All
  });

  const activeCount = downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'merging' || d.status === 'paused'
  ).length;
  const completedCount = downloads.filter((d) => d.status === 'completed').length;
  const failedCount = downloads.filter(
    (d) => d.status === 'cancelled' || d.status === 'failed'
  ).length;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '10px',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.4)'
          : '0 1px 3px rgba(60,64,67,0.08), 0 2px 8px rgba(60,64,67,0.04)',
      }}
    >
      {/* Queue Header & Filter Tabs */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: isDark ? '#111827' : '#fafbfc',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DownloadForOfflineIcon sx={{ color: isDark ? '#60a5fa' : '#1a73e8', fontSize: 26 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {t ? t('downloadsManager') : 'Downloads Manager'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {activeCount > 0
                ? `${activeCount} ${t ? t('activeTransfers') : 'active transfer(s)'}`
                : t
                ? t('allIdle')
                : 'All downloads idle'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                minHeight: 38,
                py: 0.5,
                px: 1.8,
                fontSize: '0.85rem',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: isDark ? '#60a5fa' : '#1a73e8',
                },
              },
            }}
          >
            <Tab label={`${t ? t('tabAll') : 'All'} (${downloads.length})`} />
            <Tab label={`${t ? t('tabActive') : 'Active'} (${activeCount})`} />
            <Tab label={`${t ? t('tabCompleted') : 'Completed'} (${completedCount})`} />
            <Tab label={`${t ? t('tabFailed') : 'Failed / Cancelled'} (${failedCount})`} />
          </Tabs>

          <Button
            size="small"
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={onOpenFolder}
            sx={{
              ml: 1,
              borderRadius: '6px',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#dadce0',
              color: 'text.primary',
              fontSize: '0.82rem',
              '&:hover': {
                borderColor: isDark ? '#60a5fa' : '#1a73e8',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f3f4',
              },
            }}
          >
            {t ? t('openFolderBtn') : 'Downloads Folder'}
          </Button>

          {onPlayLocalFile && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<VideoLibraryOutlinedIcon />}
              onClick={onPlayLocalFile}
              sx={{
                ml: 1,
                borderRadius: '6px',
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#dadce0',
                color: 'text.primary',
                fontSize: '0.82rem',
                '&:hover': {
                  borderColor: isDark ? '#4ade80' : '#16a34a',
                  backgroundColor: isDark ? 'rgba(74, 222, 128, 0.08)' : 'rgba(22, 163, 74, 0.06)',
                },
              }}
            >
              {t ? t('btnPlayLocalMedia') : 'Play Local Video'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Queue Items Table */}
      {filteredDownloads.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#e8f0fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <DownloadForOfflineIcon sx={{ fontSize: 38, color: isDark ? '#60a5fa' : '#1a73e8' }} />
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
            {t ? t('emptyQueueTitle') : 'No downloads in this queue'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
            {t
              ? t('emptyQueueDesc')
              : 'Paste a YouTube link in the top bar and click "Analyze" to start downloading.'}
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 420, overflowX: 'hidden' }}>
          <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    backgroundColor: isDark ? '#1a2234' : '#f1f3f4',
                    fontWeight: 600,
                    color: 'text.primary',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                <TableCell sx={{ minWidth: 150 }}>{t ? t('colFileName') : 'File Name'}</TableCell>
                <TableCell sx={{ width: 85 }}>{t ? t('colQuality') : 'Quality'}</TableCell>
                <TableCell sx={{ width: 125 }}>{t ? t('colStatus') : 'Status'}</TableCell>
                <TableCell sx={{ width: 165 }}>{t ? t('colProgress') : 'Progress'}</TableCell>
                <TableCell sx={{ width: 95 }}>{t ? t('colSpeed') : 'Speed'}</TableCell>
                <TableCell sx={{ width: 80 }}>{t ? t('colEta') : 'ETA'}</TableCell>
                <TableCell align="right" sx={{ width: 115 }}>
                  {t ? t('colActions') : 'Actions'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDownloads.map((item) => {
                const isDownloading = item.status === 'downloading';
                const isMerging = item.status === 'merging';
                const isPaused = item.status === 'paused';
                const isCompleted = item.status === 'completed';
                const isCancelled = item.status === 'cancelled';
                const isFailed = item.status === 'failed';

                return (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& td': { borderBottom: `1px solid ${theme.palette.divider}` },
                      backgroundColor: isDownloading
                        ? isDark
                          ? 'rgba(59, 130, 246, 0.08)'
                          : '#f8faff'
                        : isPaused
                        ? isDark
                          ? 'rgba(234, 179, 8, 0.08)'
                          : '#fffdf5'
                        : 'inherit',
                    }}
                  >
                    {/* File Name & Thumbnail */}
                    <TableCell sx={{ minWidth: 0, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          minWidth: 0,
                          overflow: 'hidden',
                          cursor: isCompleted ? 'pointer' : 'default',
                          '&:hover .play-overlay': { opacity: 1 },
                        }}
                        onClick={() => {
                          if (isCompleted && onPlayMedia) {
                            onPlayMedia(item);
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative', width: 52, height: 32, flexShrink: 0 }}>
                          {item.thumbnail ? (
                            <Box
                              component="img"
                              src={item.thumbnail}
                              alt=""
                              sx={{
                                width: 52,
                                height: 32,
                                borderRadius: '4px',
                                objectFit: 'cover',
                                backgroundColor: '#000',
                              }}
                            />
                          ) : item.isAudioOnly ? (
                            <MusicNoteIcon sx={{ color: isDark ? '#4ade80' : '#188038', fontSize: 26 }} />
                          ) : (
                            <MovieIcon sx={{ color: isDark ? '#60a5fa' : '#1a73e8', fontSize: 26 }} />
                          )}

                          {isCompleted && (
                            <Box
                              className="play-overlay"
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '4px',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                              }}
                            >
                              <PlayArrowIcon sx={{ color: '#fff', fontSize: 20 }} />
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                          <Tooltip title={item.title}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block',
                                width: '100%',
                              }}
                            >
                              {item.title}
                            </Typography>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.totalSize ? `Size: ${item.totalSize}` : 'Calculating size...'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Resolution / Type */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.isAudioOnly ? 'Audio' : `${item.resolution}p`}
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: item.isAudioOnly
                            ? isDark
                              ? 'rgba(34, 197, 94, 0.2)'
                              : '#e6f4ea'
                            : isDark
                            ? 'rgba(59, 130, 246, 0.2)'
                            : '#e8f0fe',
                          color: item.isAudioOnly
                            ? isDark
                              ? '#4ade80'
                              : '#137333'
                            : isDark
                            ? '#60a5fa'
                            : '#1a73e8',
                          borderRadius: '4px',
                        }}
                      />
                    </TableCell>

                    {/* Status Chip */}
                    <TableCell>
                      {isDownloading && (
                        <Chip
                          size="small"
                          label={t ? t('statusDownloading') : 'Downloading'}
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '0.72rem', borderRadius: '4px' }}
                        />
                      )}
                      {isPaused && (
                        <Chip
                          size="small"
                          label={t ? t('statusPaused') : 'Paused'}
                          sx={{
                            backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3',
                            color: isDark ? '#facc15' : '#854d0e',
                            border: `1px solid ${isDark ? 'rgba(234, 179, 8, 0.4)' : '#fde047'}`,
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                          }}
                        />
                      )}
                      {isMerging && (
                        <Chip
                          size="small"
                          label={t ? t('statusMerging') : 'Merging Streams...'}
                          sx={{
                            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef7e0',
                            color: isDark ? '#fbbf24' : '#b06000',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                          }}
                        />
                      )}
                      {isCompleted && (
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                          label={t ? t('statusCompleted') : 'Completed'}
                          color="success"
                          sx={{ fontWeight: 600, fontSize: '0.72rem', borderRadius: '4px' }}
                        />
                      )}
                      {isCancelled && (
                        <Chip
                          size="small"
                          label={t ? t('statusCancelled') : 'Cancelled'}
                          sx={{
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f3f4',
                            color: 'text.secondary',
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                          }}
                        />
                      )}
                      {isFailed && (
                        <Tooltip title={item.error || 'Download failed'}>
                          <Chip
                            size="small"
                            icon={<ErrorOutlineIcon sx={{ fontSize: '14px !important' }} />}
                            label={t ? t('statusFailed') : 'Failed'}
                            color="error"
                            sx={{ fontWeight: 600, fontSize: '0.72rem', borderRadius: '4px' }}
                          />
                        </Tooltip>
                      )}
                    </TableCell>

                    {/* Progress Bar & Details */}
                    <TableCell>
                      <Box sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                            fontSize: '0.75rem',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {isCompleted
                              ? '100%'
                              : isMerging
                              ? t
                                ? t('statusMerging')
                                : 'Merging Streams...'
                              : `${(item.progress || 0).toFixed(1)}%`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {item.totalSize || ''}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant={
                            isMerging
                              ? 'indeterminate'
                              : isCompleted
                              ? 'determinate'
                              : 'determinate'
                          }
                          value={isCompleted ? 100 : item.progress || 0}
                          color={isCompleted ? 'success' : isFailed ? 'error' : isPaused ? 'warning' : 'primary'}
                          sx={{ height: 6, borderRadius: '2px' }}
                        />
                      </Box>
                    </TableCell>

                    {/* Speed */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isDownloading && (
                          <>
                            <SpeedIcon sx={{ fontSize: 14, color: isDark ? '#60a5fa' : '#1a73e8' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {item.speed || '--'}
                            </Typography>
                          </>
                        )}
                        {isPaused && (
                          <Typography
                            variant="caption"
                            sx={{ color: isDark ? '#facc15' : '#b45309', fontWeight: 600 }}
                          >
                            {t ? t('statusPaused') : 'Paused'}
                          </Typography>
                        )}
                        {!isDownloading && !isPaused && (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            --
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* ETA */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isDownloading && (
                          <>
                            <TimerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.eta || '--'}
                            </Typography>
                          </>
                        )}
                        {!isDownloading && (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            --
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {/* Pause button */}
                        {isDownloading && (
                          <Tooltip title={t ? t('actionPause') : 'Pause Download'}>
                            <IconButton
                              size="small"
                              sx={{
                                color: isDark ? '#facc15' : '#d97706',
                                '&:hover': {
                                  backgroundColor: isDark
                                    ? 'rgba(250, 204, 21, 0.12)'
                                    : 'rgba(217, 119, 6, 0.08)',
                                },
                              }}
                              onClick={() => onPauseDownload && onPauseDownload(item.id)}
                            >
                              <PauseCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Resume button */}
                        {isPaused && (
                          <Tooltip title={t ? t('actionResume') : 'Resume Download'}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onResumeDownload && onResumeDownload(item.id)}
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Cancel button */}
                        {(isDownloading || isMerging || isPaused) && (
                          <Tooltip title={t ? t('actionCancel') : 'Cancel Download'}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onCancelDownload(item.id)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {isCompleted && (
                          <>
                            <Tooltip title={t ? t('actionPlay') : 'Play Video'}>
                              <IconButton
                                size="small"
                                sx={{
                                  color: isDark ? '#4ade80' : '#16a34a',
                                  '&:hover': {
                                    backgroundColor: isDark
                                      ? 'rgba(74, 222, 128, 0.16)'
                                      : 'rgba(22, 163, 74, 0.1)',
                                  },
                                }}
                                onClick={() => onPlayMedia && onPlayMedia(item)}
                              >
                                <PlayCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t ? t('actionShowFolder') : 'Show in folder'}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onShowInFolder(item.filePath)}
                              >
                                <FolderOpenIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {(isCompleted || isCancelled || isFailed) && (
                          <Tooltip title={t ? t('actionRemove') : 'Remove from list'}>
                            <IconButton
                              size="small"
                              onClick={() => onRemoveDownload(item.id)}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'text.primary' },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
