"use client";

import React, { createContext, useContext, useEffect, ReactNode, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { API_URL, postApi } from '@/lib/api';

interface AnalyticsContextType {
  trackEvent: (label: string, metadata?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const viewStartTsRef = useRef<number | null>(null);
  const lastPathRef = useRef<string | null>(null);

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isTablet = /iPad|Tablet/i.test(ua) || (isMobile && Math.min(window.innerWidth, window.innerHeight) > 600);
    const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

    let browser = 'Other';
    if (/Edg\//.test(ua)) browser = 'Edge';
    else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
    else if (/Chrome\//.test(ua)) browser = 'Chrome';
    else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
    else if (/Firefox\//.test(ua)) browser = 'Firefox';

    let os = 'Other';
    if (/Windows/.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS/.test(ua)) os = 'macOS';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
    else if (/Linux/.test(ua)) os = 'Linux';

    // Best-effort country from browser locale (e.g. "en-KE" → "Kenya")
    let country: string | undefined;
    try {
      const locale = navigator.language || '';
      const regionCode = locale.split('-')[1];
      if (regionCode) {
        const display = new Intl.DisplayNames(['en'], { type: 'region' });
        country = display.of(regionCode.toUpperCase());
      }
    } catch {}

    const session_id = (() => {
      let sid = sessionStorage.getItem('ouk_sid');
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('ouk_sid', sid);
      }
      return sid;
    })();

    return { device, browser, os, country, session_id };
  };

  const hasAnalyticsConsent = () => {
    try {
      const nameEQ = "ouk_cookie_consent=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          const consent = JSON.parse(c.substring(nameEQ.length, c.length));
          return consent.analytics === true;
        }
      }
    } catch (e) {}
    return false;
  };

  const trackVisit = async (path: string) => {
    if (!hasAnalyticsConsent()) return;
    try {
      const deviceInfo = getDeviceInfo();
      await postApi('/analytics/track', {
        type: 'VISIT',
        path,
        metadata: {
          referrer: document.referrer || undefined,
          screen_size: `${window.innerWidth}x${window.innerHeight}`,
          ...deviceInfo,
        },
      });
    } catch (error) {
       // Silent fail for analytics to not disturb user
       console.warn('Telemetry sync deferred');
    }
  };

  const trackDuration = async (path: string, durationMs: number) => {
    if (!hasAnalyticsConsent()) return;
    try {
      await fetch(`${API_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'HEARTBEAT',
          path,
          metadata: {
            duration_ms: Math.max(0, Math.round(durationMs)),
          },
        }),
        keepalive: true,
      });
    } catch (error) {
      console.warn('Duration telemetry sync deferred');
    }
  };

  const trackEvent = async (label: string, metadata: any = {}) => {
    if (!hasAnalyticsConsent()) return;
    try {
      await postApi('/analytics/track', {
        type: 'CLICK',
        path: pathname,
        label,
        metadata
      });
    } catch (error) {
       console.warn('Event telemetry sync deferred');
    }
  };

  useEffect(() => {
    if (!pathname) return;

    const now = Date.now();
    const prevPath = lastPathRef.current;
    const prevStart = viewStartTsRef.current;

    if (prevPath && prevStart) {
      trackDuration(prevPath, now - prevStart);
    }

    lastPathRef.current = pathname;
    viewStartTsRef.current = now;
    trackVisit(pathname);

    return () => {
      const cleanupPath = lastPathRef.current;
      const cleanupStart = viewStartTsRef.current;
      if (cleanupPath && cleanupStart) {
        trackDuration(cleanupPath, Date.now() - cleanupStart);
      }
    };
  }, [pathname]);

  // Re-check consent without waiting for navigation (banner accept/reject).
  useEffect(() => {
    const onConsent = () => {
      if (hasAnalyticsConsent() && pathname) {
        trackVisit(pathname);
      }
    };
    window.addEventListener("cookie_consent_updated", onConsent);
    return () => window.removeEventListener("cookie_consent_updated", onConsent);
  }, [pathname]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
