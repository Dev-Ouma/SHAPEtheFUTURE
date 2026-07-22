"use client";

import React from "react";

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Required for informative images. Use "" for decorative. */
  alt: string;
  decorative?: boolean;
};

/**
 * Image with WCAG-friendly defaults: always exposes alt (empty when decorative).
 */
export function AccessibleImage({ alt, decorative, ...rest }: ImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...rest} alt={decorative ? "" : alt} role={decorative ? "presentation" : undefined} />
  );
}

type MediaProps = {
  title: string;
  src: string;
  poster?: string;
  captionsSrc?: string;
  captionsLabel?: string;
  transcript?: string;
  signLanguageSrc?: string;
  className?: string;
};

/**
 * Video/audio player with captions track + optional transcript / sign-language link.
 */
export function AccessibleMedia({
  title,
  src,
  poster,
  captionsSrc,
  captionsLabel = "English captions",
  transcript,
  signLanguageSrc,
  className,
}: MediaProps) {
  const isAudio = /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(src);

  return (
    <figure className={className}>
      <figcaption className="sr-only">{title}</figcaption>
      {isAudio ? (
        <audio controls className="w-full" preload="metadata">
          <source src={src} />
          {captionsSrc ? (
            <track kind="captions" src={captionsSrc} srcLang="en" label={captionsLabel} default />
          ) : null}
          Your browser does not support the audio element.
        </audio>
      ) : (
        <video controls className="w-full" poster={poster} preload="metadata">
          <source src={src} />
          {captionsSrc ? (
            <track kind="captions" src={captionsSrc} srcLang="en" label={captionsLabel} default />
          ) : null}
          Your browser does not support the video element.
        </video>
      )}
      {(transcript || signLanguageSrc) && (
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          {transcript ? (
            <details className="border border-slate-200 p-3">
              <summary className="font-bold text-primary-darker cursor-pointer">Transcript</summary>
              <div className="mt-3 whitespace-pre-wrap leading-relaxed">{transcript}</div>
            </details>
          ) : null}
          {signLanguageSrc ? (
            <p>
              <a
                href={signLanguageSrc}
                className="font-bold text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign language version
              </a>
            </p>
          ) : null}
        </div>
      )}
      {!captionsSrc && !transcript ? (
        <p className="mt-2 text-xs text-amber-700" role="status">
          Captions or a transcript should be provided for this media (WCAG 1.2.2).
        </p>
      ) : null}
    </figure>
  );
}
