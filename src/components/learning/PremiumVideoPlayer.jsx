import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Bookmark as BookmarkIcon, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function PremiumVideoPlayer({ lesson, progress, user, accessLevel = 'FULL', maxPreviewSeconds = 90, onProgressUpdate }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const effectiveDuration = (accessLevel === 'PREVIEW' && maxPreviewSeconds)
    ? Math.min(duration || 0, maxPreviewSeconds)
    : (duration || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (videoRef.current && progress?.last_position_seconds) {
      videoRef.current.currentTime = progress.last_position_seconds;
    }
  }, [progress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Preview enforcement: do not allow playback past maxPreviewSeconds
      if (accessLevel === 'PREVIEW' && maxPreviewSeconds && video.currentTime >= maxPreviewSeconds) {
        video.currentTime = maxPreviewSeconds;
        setCurrentTime(maxPreviewSeconds);
        if (!video.paused) video.pause();
        setPlaying(false);
        if (!previewEnded) {
          setPreviewEnded(true);
          toast.info('Preview ended. Enroll to continue.');
        }
        return;
      }

      setCurrentTime(video.currentTime);

      // Auto-save progress every 5 seconds (clamped in preview)
      if (Math.floor(video.currentTime) % 5 === 0) {
        saveProgress(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const saveProgress = async (position) => {
    const clampedPosition = (accessLevel === 'PREVIEW' && maxPreviewSeconds)
      ? Math.min(position, maxPreviewSeconds)
      : position;

    const denom = effectiveDuration > 0 ? effectiveDuration : (duration > 0 ? duration : 0);
    const percentage = denom > 0 ? (clampedPosition / denom) * 100 : 0;

    if (progress) {
      await base44.entities.UserProgress.update(progress.id, {
        last_position_seconds: Math.floor(clampedPosition),
        progress_percentage: Math.floor(percentage),
        last_played_at: new Date().toISOString(),
        completed: percentage >= 90
      });
    } else {
      await base44.entities.UserProgress.create({
        school_id: lesson.school_id,
        user_email: user.email,
        lesson_id: lesson.id,
        course_id: lesson.course_id,
        last_position_seconds: Math.floor(clampedPosition),
        progress_percentage: Math.floor(percentage),
        last_played_at: new Date().toISOString(),
        completed: percentage >= 90
      });
    }

    onProgressUpdate?.();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    const target = video.currentTime + seconds;
    const clamped = (accessLevel === 'PREVIEW' && maxPreviewSeconds)
      ? Math.max(0, Math.min(target, maxPreviewSeconds))
      : Math.max(0, Math.min(target, duration || 0));
    video.currentTime = clamped;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (value) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = value[0];
    const max = (accessLevel === 'PREVIEW' && maxPreviewSeconds) ? maxPreviewSeconds : (duration || 0);
    const clamped = Math.max(0, Math.min(newTime, max));
    setCurrentTime(clamped);
    video.currentTime = clamped;
  };

  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={lesson.video_url}
        className="w-full aspect-video"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      
      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={effectiveDuration}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button size="icon" variant="ghost" onClick={() => skip(-10)} className="text-white hover:bg-white/20">
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button size="icon" variant="ghost" onClick={() => skip(10)} className="text-white hover:bg-white/20">
              <SkipForward className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-2 ml-4">
              <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4 mr-1" />
                {playbackRate}x
              </Button>
              
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-slate-900 rounded-lg shadow-xl p-2 space-y-1">
                  {speeds.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`block w-full px-3 py-1 text-sm rounded hover:bg-slate-700 ${
                        playbackRate === speed ? 'bg-slate-700 text-amber-400' : 'text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Prompt */}
      {progress?.last_position_seconds > 30 && currentTime === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 p-6 rounded-lg">
          <p className="text-white mb-4">Resume from {formatTime(progress.last_position_seconds)}?</p>
          <div className="flex space-x-2">
            <Button onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = progress.last_position_seconds;
              }
            }}>
              Resume
            </Button>
            <Button variant="outline" onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
              }
            }}>
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}