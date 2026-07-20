"use client";

import Image, { ImageProps } from "next/image";
import React from "react";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallback?: React.ReactNode;
};

/**
 * next/image wrapper that tolerates empty/CMS URLs.
 * Uses fill when width/height omitted and className includes absolute/fill patterns.
 */
export default function SafeImage({
  src,
  alt,
  fallback = null,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  ...rest
}: SafeImageProps) {
  if (!src) return <>{fallback}</>;

  const useFill = fill === true || (!width && !height);

  if (useFill) {
    return (
      <Image
        src={src}
        alt={alt || ""}
        fill
        sizes={sizes || "100vw"}
        className={className}
        priority={priority}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ""}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      {...rest}
    />
  );
}
