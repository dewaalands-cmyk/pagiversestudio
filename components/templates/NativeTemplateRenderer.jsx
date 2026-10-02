"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildDefaultConfig, getTemplateEntry, getTemplateThumbnail } from "@/lib/template-library";

export default function NativeTemplateRenderer({ template, config = {}, compact = false, deviceMode = "auto" }) {
  const frameRef = useRef(null);
  const configuration = useMemo(
    () => ({ ...buildDefaultConfig(template), ...config }),
    [template, config],
  );

  function sendConfiguration() {
    frameRef.current?.contentWindow?.postMessage({
      type: "pagiverse:config",
      templateId: template.id,
      configuration,
    }, window.location.origin);
  }

  useEffect(() => {
    sendConfiguration();
  }, [configuration]);

  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "pagiverse:ready" && event.data?.templateId === template.id) sendConfiguration();
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [configuration, template.id]);

  if (compact) {
    return <img src={getTemplateThumbnail(template)} alt={`${template.name} template preview`} className="h-full min-h-[320px] w-full object-cover object-top" />;
  }

  return (
    <iframe
      ref={frameRef}
      src={getTemplateEntry(template)}
      title={`${template.name} live preview`}
      onLoad={sendConfiguration}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className={`block w-full border-0 bg-white ${deviceMode === "mobile" ? "h-[760px]" : "h-[900px]"}`}
    />
  );
}
