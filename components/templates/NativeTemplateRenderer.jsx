"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildDefaultConfig, getTemplateEntry, getTemplateThumbnail } from "@/lib/template-library";

export default function NativeTemplateRenderer({ template, config = {}, compact = false, deviceMode = "auto" }) {
  const frameRef = useRef(null);
  const configurationRef = useRef(config);
  const revisionRef = useRef(0);
  const timeoutRef = useRef(null);
  const [previewStatus, setPreviewStatus] = useState("connecting");
  const configuration = useMemo(
    () => ({ ...buildDefaultConfig(template), ...config }),
    [template, config],
  );
  const previewUrl = `${getTemplateEntry(template)}?embed=${encodeURIComponent(`${template.id}-${template.pagiverseStandard ?? 1}-${template.price ?? 0}`)}`;

  useEffect(() => {
    configurationRef.current = configuration;
  }, [configuration]);

  const sendConfiguration = useCallback(() => {
    if (!frameRef.current?.contentWindow) return;
    const revision = revisionRef.current + 1;
    revisionRef.current = revision;
    setPreviewStatus("syncing");
    frameRef.current.contentWindow.postMessage({
      type: "pagiverse:config",
      templateId: template.id,
      configuration: configurationRef.current,
      revision,
    }, window.location.origin);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (revisionRef.current === revision) setPreviewStatus("error");
    }, 3000);
  }, [template.id]);

  useEffect(() => {
    sendConfiguration();
  }, [configuration, sendConfiguration]);

  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.templateId !== template.id) return;
      if (event.data?.type === "pagiverse:ready") sendConfiguration();
      if (event.data?.type === "pagiverse:applied" && event.data?.revision === revisionRef.current) {
        window.clearTimeout(timeoutRef.current);
        setPreviewStatus("ready");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timeoutRef.current);
    };
  }, [sendConfiguration, template.id]);

  if (compact) {
    return <img src={getTemplateThumbnail(template)} alt={`${template.name} template preview`} className="h-full min-h-[320px] w-full object-cover object-top" />;
  }

  return (
    <div className="relative">
      <iframe
        ref={frameRef}
        src={previewUrl}
        title={`${template.name} live preview`}
        onLoad={sendConfiguration}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className={`block w-full border-0 bg-white ${deviceMode === "mobile" ? "h-[760px]" : "h-[900px]"}`}
      />
      {previewStatus !== "ready" && (
        <p
          role="status"
          aria-live="polite"
          className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-extrabold shadow-lg ${previewStatus === "error" ? "bg-red-600 text-white" : "bg-white/95 text-navy-deep"}`}
        >
          {previewStatus === "error" ? "Preview tidak merespons" : "Menyinkronkan preview..."}
        </p>
      )}
    </div>
  );
}
