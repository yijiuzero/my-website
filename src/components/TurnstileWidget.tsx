"use client";

import Script from "next/script";
import { useRef, useCallback, useState, useEffect } from "react";

declare global {
  interface Window {
    turnstile: {
      render: (
        el: string | HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (id: string) => void;
    };
  }
}

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile 验证组件。
 * 仅在 NEXT_PUBLIC_TURNSTILE_SITE_KEY 存在时渲染。
 */
export function TurnstileWidget({ onVerify, onExpire }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onVerify);
  callbackRef.current = onVerify;
  const [ready, setReady] = useState(false);

  // 未配置 site key 时，自动放行（通知父组件无需等待验证）
  useEffect(() => {
    if (!siteKey) onVerify("__turnstile_disabled__");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!siteKey) return null;

  const render = useCallback(() => {
    if (!containerRef.current || !siteKey) return;
    if (widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
      return;
    }
    widgetIdRef.current = window.turnstile?.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: (token: string) => callbackRef.current(token),
      "expired-callback": () => {
        onExpire?.();
        callbackRef.current("");
      },
    });
    setReady(true);
  }, [siteKey, onExpire]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onLoad={render}
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="mt-3 flex justify-center" />
    </>
  );
}
