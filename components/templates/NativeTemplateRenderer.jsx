"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildDefaultConfig, getTemplateEntry, getTemplateThumbnail } from "@/lib/template-library";

export default function NativeTemplateRenderer({ template, config = {}, compact = false, lang = "id", deviceMode = "auto" }) {
  const frameRef = useRef(null);
  const [documentHtml, setDocumentHtml] = useState("");
  const [loadError, setLoadError] = useState(false);
  const configuration = useMemo(
    () => ({ ...buildDefaultConfig(template), ...config }),
    [template, config],
  );

  useEffect(() => {
    if (compact) return;
    const controller = new AbortController();
    setDocumentHtml("");
    setLoadError(false);
    fetch(getTemplateEntry(template), { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Template request failed with ${response.status}`);
        return response.text();
      })
      .then((html) => {
        const baseElement = `<base href="${template.publicPath}/">`;
        const prepared = /<head(?:\s[^>]*)?>/i.test(html)
          ? html.replace(/<head(?:\s[^>]*)?>/i, (head) => `${head}${baseElement}`)
          : `${baseElement}${html}`;
        setDocumentHtml(prepared);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, [compact, template]);

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

  if (loadError) {
    return <div className="flex h-[760px] items-center justify-center bg-white px-6 text-center text-sm font-bold text-red-700">{lang === "id" ? "Preview belum dapat dimuat. Silakan muat ulang halaman." : "The preview could not be loaded. Please refresh the page."}</div>;
  }

  if (!documentHtml) {
    return <div className="flex h-[760px] items-center justify-center bg-white text-sm font-bold text-navy-deep/45">{lang === "id" ? "Memuat preview..." : "Loading preview..."}</div>;
  }

  return (
    <iframe
      ref={frameRef}
      srcDoc={documentHtml}
      title={`${template.name} live preview`}
      onLoad={sendConfiguration}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className={`block w-full border-0 bg-white ${deviceMode === "mobile" ? "h-[760px]" : "h-[900px]"}`}
    />
  );
}
