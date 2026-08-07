'use client';

import { useEffect, useRef, useState } from 'react';

type VehicleDetailHeroMediaProps = {
  posterUrl: string | null;
  videoUrl: string | null;
  mediaClassName: string;
};

/**
 * Shows the primary listing photo immediately, then loads and fades in the hero video.
 */
export function VehicleDetailHeroMedia({
  posterUrl,
  videoUrl,
  mediaClassName,
}: VehicleDetailHeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [posterReady, setPosterReady] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;
    const frame = requestAnimationFrame(() => setLoadVideo(true));
    return () => cancelAnimationFrame(frame);
  }, [videoUrl]);

  useEffect(() => {
    if (!loadVideo || !videoUrl) return;
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => setVideoReady(true);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);

    void video.play().catch(() => undefined);

    return () => {
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
    };
  }, [loadVideo, videoUrl]);

  const fadePoster = Boolean(videoUrl && videoReady);

  return (
    <>
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          loading="eager"
          decoding="async"
          onLoad={() => setPosterReady(true)}
          className={`${mediaClassName} transition-opacity duration-700 ease-out ${
            fadePoster || !posterReady ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : null}

      {loadVideo && videoUrl ? (
        <video
          ref={videoRef}
          className={`${mediaClassName} scale-[1.02] transition-opacity duration-700 ease-out ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={posterUrl ?? undefined}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
