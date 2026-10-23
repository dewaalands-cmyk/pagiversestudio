"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { STUDIO_SHOWCASE } from "./showcase-data";

export default function StudioHero() {
  const { lang } = useLang();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const id = lang === "id";
  return (
    <section ref={ref} className="pg-hero" aria-labelledby="pg-hero-title" data-running={visible}>
      <div className="pg-hero-copy"><h1 id="pg-hero-title">{id ? <><span>Website kamu.</span><br /><span>Dengan caramu.</span></> : <><span>Your website.</span><br /><span>Your way.</span></>}</h1></div>
      <div className="pg-hero-art" aria-hidden="true"><div className="pg-staircase">
        {[...STUDIO_SHOWCASE, ...STUDIO_SHOWCASE].map((site, index) => (
          <figure key={`${site.id}-${index}`} className="pg-hero-tile" style={{ "--tile-index": index }}>
            <Image src={site.image} alt="" fill priority={index >= 2 && index <= 5} sizes="(max-width: 767px) 340px, 560px" />
          </figure>
        ))}
      </div></div>
    </section>
  );
}
