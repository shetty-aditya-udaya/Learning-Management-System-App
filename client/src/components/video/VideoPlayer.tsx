"use client";

import React, { useRef, useEffect, useState } from "react";
import { useProgressStore } from "@/stores/useProgressStore";
import { api } from "@/lib/api";

type VideoPlayerProps = {
  courseId: string;
  lessonId: string;
  videoUrl: string;
  initialSeconds: number;
  nextLessonId?: string | null;
};

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function VideoPlayer({ courseId, lessonId, videoUrl, initialSeconds, nextLessonId }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const { setLesson, updateHeartbeat, markCompleted, isCompleted, watchedSeconds } = useProgressStore();
  const [apiReady, setApiReady] = useState(false);

  // Extract YouTube ID
  const videoId = videoUrl.split("/embed/")[1]?.split("?")[0] || videoUrl;

  useEffect(() => {
    // 1. Load the YouTube IFrame Player API code asynchronously
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  useEffect(() => {
    if (!apiReady || !containerRef.current) return;

    // Initialize store
    setLesson(lessonId, initialSeconds, false);

    // 2. Initialize the player
    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "100%",
      width: "100%",
      videoId: videoId,
      playerVars: {
        start: initialSeconds,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            handleEnded();
          }
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, lessonId, videoId]);

  useEffect(() => {
    // Heartbeat interval
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getPlayerState() === 1) { // 1 = PLAYING
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        if (currentTime > watchedSeconds) {
          updateHeartbeat(currentTime);
          api.put(`/progress/${courseId}/lesson/${lessonId}/heartbeat`, {
            watchedSeconds: currentTime
          }).catch(console.error);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [courseId, lessonId, watchedSeconds]);

  const handleEnded = async () => {
    markCompleted();
    try {
      await api.post(`/progress/${courseId}/lesson/${lessonId}/complete`);
      
      // Auto-advance
      if (nextLessonId) {
         setTimeout(() => {
            window.location.href = `/dashboard/learn/${courseId}/lesson/${nextLessonId}`;
         }, 2000);
      }
    } catch (err) {
      console.error("Failed to mark complete", err);
    }
  };

  return (
    <div className="w-full bg-black aspect-video rounded-2xl overflow-hidden shadow-2xl relative border-4 border-indigo-900/10">
      <div ref={containerRef} className="w-full h-full" />
      {isCompleted && (
        <div className="absolute top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl animate-bounce">
          Lesson Completed!
        </div>
      )}
    </div>
  );
}
