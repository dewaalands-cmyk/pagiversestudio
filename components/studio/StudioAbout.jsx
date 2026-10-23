"use client";
import { useLang } from "@/components/LanguageProvider";
import Reveal from "@/components/Reveal";
import StudioEditorDemo from "./StudioEditorDemo";

export default function StudioAbout({ demoTemplates }) {
  const { lang } = useLang();
  const id = lang === "id";
  return <section id="tentang" className="pg-about" aria-labelledby="pg-about-title"><div className="pg-shell"><Reveal className="pg-section-intro"><h2 id="pg-about-title">{id ? <>Sudah ada awalnya.<br />Tinggal jadi kamu.</> : <>A head start.<br />Make it yours.</>}</h2><p>{id ? "Pilih desain yang cocok, lalu sesuaikan teks, foto, dan warna dengan kebutuhanmu. Rasakan mudahnya membuat website di editor Pagiverse." : "Choose a design, then make the words, images, and colors your own. Discover an easier way to build in the Pagiverse editor."}</p></Reveal><StudioEditorDemo templates={demoTemplates} /></div></section>;
}
