"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2, Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Settings = Record<string, string>;
type CardItem = { title: string; desc: string };

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  multiline,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  multiline?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const cls =
    "w-full px-4 py-2.5 rounded-lg border border-cloud-200 dark:border-white/10 bg-cloud-50 dark:bg-navy-deep text-navy-deep dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 resize-none";
  return (
    <div>
      <label className="block text-sm font-medium text-navy-deep dark:text-cloud-100 mb-1">
        {label}
        {hint && <span className="ml-1.5 text-xs text-slate-400 font-normal">{hint}</span>}
      </label>
      {multiline ? (
        <textarea rows={3} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function SaveBar({
  saving,
  saved,
  onSave,
}: {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-cloud-200 dark:border-white/10">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-mint hover:bg-mint/90 disabled:opacity-60 text-navy-deep font-semibold rounded-lg text-sm transition-colors"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
      {saved && <span className="text-sm text-green-500 font-medium">Tersimpan!</span>}
    </div>
  );
}

// ─── List editor (used for About cards & Services items) ──────────────────────

function ListEditor({
  items,
  onChange,
  addLabel = "Tambah Item",
}: {
  items: CardItem[];
  onChange: (items: CardItem[]) => void;
  addLabel?: string;
}) {
  const update = (i: number, field: "title" | "desc", val: string) => {
    const next = items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item));
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { title: "", desc: "" }]);
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-cloud-200 dark:border-white/10 bg-cloud-50 dark:bg-navy-deep text-navy-deep dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 resize-none";

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft p-4 space-y-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Item {i + 1}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 rounded text-slate-400 hover:text-navy-deep dark:hover:text-white disabled:opacity-30"
                title="Pindah ke atas"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-1 rounded text-slate-400 hover:text-navy-deep dark:hover:text-white disabled:opacity-30"
                title="Pindah ke bawah"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => remove(i)}
                className="p-1 rounded text-red-400 hover:text-red-600"
                title="Hapus"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Judul"
            className={inputCls}
            value={item.title}
            onChange={(e) => update(i, "title", e.target.value)}
          />
          <textarea
            rows={2}
            placeholder="Deskripsi"
            className={inputCls}
            value={item.desc}
            onChange={(e) => update(i, "desc", e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={add}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-mint/50 text-mint text-sm hover:bg-mint/10 transition-colors"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft p-6 space-y-4">
      <h2 className="text-base font-bold text-navy-deep dark:text-white border-b border-cloud-200 dark:border-white/10 pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = ["Hero", "Tentang", "Layanan", "Portfolio", "Kontak & SEO"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("Hero");

  // parsed list states (synced to settings via JSON)
  const [aboutCards, setAboutCards] = useState<CardItem[]>([]);
  const [serviceItems, setServiceItems] = useState<CardItem[]>([]);

  const defaultAboutCards: CardItem[] = [
    { title: "Cepat & Modern", desc: "Dibangun dengan teknologi terkini (Next.js) agar website ringan dan enak diakses." },
    { title: "Rapi di HP", desc: "Tampilan otomatis menyesuaikan di ponsel, tablet, maupun komputer." },
    { title: "Siap Ditemukan", desc: "Dioptimasi dasar untuk SEO supaya lebih mudah muncul di pencarian Google." },
    { title: "Komunikasi Jelas", desc: "Proses transparan dari awal hingga tayang. Setiap revisi direspon cepat." },
  ];
  const defaultServiceItems: CardItem[] = [
    { title: "Website Company Profile", desc: "Halaman profil resmi untuk bisnis, organisasi, atau event — lengkap dengan layanan, portofolio, dan kontak." },
    { title: "Landing Page & Website UMKM", desc: "Satu halaman fokus untuk promosi produk. Ringkas, meyakinkan, dan mengarahkan calon pembeli untuk menghubungimu." },
    { title: "SEO & Optimasi", desc: "Pemasangan SEO dasar, meta tag, dan struktur rapi agar website lebih mudah ditemukan di Google." },
    { title: "Redesign & Maintenance", desc: "Punya website lama yang terlihat usang? Kami percantik ulang dan bantu rawat agar tetap update." },
    { title: "Sistem Kasir, Stok & Keuangan", desc: "Tidak perlu lagi mencatat manual atau khawatir stok tidak akurat. Sistem kami menangani kasir, persediaan, dan laporan keuangan secara otomatis." },
  ];

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        try { setAboutCards(JSON.parse(data.about_cards)); } catch { setAboutCards(defaultAboutCards); }
        try { setServiceItems(JSON.parse(data.services_items)); } catch { setServiceItems(defaultServiceItems); }
        setLoading(false);
      });
  }, []);

  const set = (key: string, val: string) => setSettings((s) => ({ ...s, [key]: val }));
  const get = (key: string, fallback = "") => settings[key] ?? fallback;

  const save = useCallback(async () => {
    const payload: Settings = {
      ...settings,
      about_cards: JSON.stringify(aboutCards),
      services_items: JSON.stringify(serviceItems),
    };
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [settings, aboutCards, serviceItems]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader title="Settings" />
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-mint" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Settings" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-cloud-50 dark:bg-white/5 p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white dark:bg-navy-soft shadow text-navy-deep dark:text-white"
                  : "text-slate-muted dark:text-slate-label hover:text-navy-deep dark:hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        {tab === "Hero" && (
          <Section title="Bagian Hero (halaman utama)">
            <Field label="Badge / Tagline kecil" hint="teks di bawah ikon titik hijau" value={get("hero_badge")} onChange={(v) => set("hero_badge", v)} />
            <Field label="Judul Utama (baris 1)" value={get("hero_h1")} onChange={(v) => set("hero_h1", v)} />
            <Field label="Kata Aksen (warna mint)" hint="kata yang diberi warna berbeda" value={get("hero_h1_accent")} onChange={(v) => set("hero_h1_accent", v)} />
            <Field label="Judul Utama (baris akhir)" value={get("hero_h1_end")} onChange={(v) => set("hero_h1_end", v)} />
            <Field label="Deskripsi / Paragraf" multiline value={get("hero_desc")} onChange={(v) => set("hero_desc", v)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Tombol Utama (CTA 1)" hint="tombol hijau" value={get("hero_cta1")} onChange={(v) => set("hero_cta1", v)} />
              <Field label="Tombol Kedua (CTA 2)" hint="tombol border" value={get("hero_cta2")} onChange={(v) => set("hero_cta2", v)} />
            </div>
            <Field label="Tagline kecil bawah tombol" value={get("hero_tagline")} onChange={(v) => set("hero_tagline", v)} />
            <SaveBar saving={saving} saved={saved} onSave={save} />
          </Section>
        )}

        {/* ── TENTANG ──────────────────────────────────────────────────── */}
        {tab === "Tentang" && (
          <Section title="Bagian Tentang Kami">
            <Field label="Label seksi" hint='misal: "Tentang Kami"' value={get("about_label")} onChange={(v) => set("about_label", v)} />
            <Field label="Judul" value={get("about_title")} onChange={(v) => set("about_title", v)} />
            <Field label="Paragraf 1" multiline value={get("about_p1")} onChange={(v) => set("about_p1", v)} />
            <Field label="Paragraf 2" multiline value={get("about_p2")} onChange={(v) => set("about_p2", v)} />
            <Field label="Paragraf 3" multiline value={get("about_p3")} onChange={(v) => set("about_p3", v)} />

            <div>
              <p className="text-sm font-medium text-navy-deep dark:text-cloud-100 mb-2">
                Kartu Fitur
                <span className="ml-2 text-xs text-slate-400 font-normal">tampil di grid kanan (maks 4 disarankan)</span>
              </p>
              <ListEditor
                items={aboutCards}
                onChange={setAboutCards}
                addLabel="Tambah Kartu"
              />
            </div>
            <SaveBar saving={saving} saved={saved} onSave={save} />
          </Section>
        )}

        {/* ── LAYANAN ──────────────────────────────────────────────────── */}
        {tab === "Layanan" && (
          <Section title="Bagian Layanan">
            <Field label="Label seksi" hint='misal: "Layanan"' value={get("services_label")} onChange={(v) => set("services_label", v)} />
            <Field label="Judul" value={get("services_title")} onChange={(v) => set("services_title", v)} />
            <Field label="Sub-judul" multiline value={get("services_subtitle")} onChange={(v) => set("services_subtitle", v)} />

            <div>
              <p className="text-sm font-medium text-navy-deep dark:text-cloud-100 mb-2">
                Daftar Layanan
                <span className="ml-2 text-xs text-slate-400 font-normal">tampil sebagai kartu di grid</span>
              </p>
              <ListEditor
                items={serviceItems}
                onChange={setServiceItems}
                addLabel="Tambah Layanan"
              />
            </div>
            <SaveBar saving={saving} saved={saved} onSave={save} />
          </Section>
        )}

        {/* ── PORTFOLIO ────────────────────────────────────────────────── */}
        {tab === "Portfolio" && (
          <Section title="Bagian Portfolio">
            <div className="rounded-xl bg-mint/5 border border-mint/20 px-4 py-3 text-sm text-teal-700 dark:text-mint">
              Item portfolio dikelola di menu <strong>Portfolio</strong> (sidebar kiri). Di sini hanya pengaturan teks heading section-nya.
            </div>
            <Field label="Label seksi" hint='misal: "Portfolio"' value={get("portfolio_label")} onChange={(v) => set("portfolio_label", v)} />
            <Field label="Judul" value={get("portfolio_title")} onChange={(v) => set("portfolio_title", v)} />
            <Field label="Sub-judul" multiline value={get("portfolio_subtitle")} onChange={(v) => set("portfolio_subtitle", v)} />
            <SaveBar saving={saving} saved={saved} onSave={save} />
          </Section>
        )}

        {/* ── KONTAK & SEO ─────────────────────────────────────────────── */}
        {tab === "Kontak & SEO" && (
          <>
            <Section title="Kontak">
              <Field label="Nomor WhatsApp" hint="format: 6289502839893 (tanpa +)" value={get("contact_whatsapp")} onChange={(v) => set("contact_whatsapp", v)} />
              <Field label="Email" value={get("contact_email")} onChange={(v) => set("contact_email", v)} />
              <Field label="Instagram Handle" hint='misal: @pagiversestudio' value={get("contact_instagram")} onChange={(v) => set("contact_instagram", v)} />
              <Field label="Judul bagian Kontak" value={get("contact_heading")} onChange={(v) => set("contact_heading", v)} />
              <Field label="Deskripsi bagian Kontak" multiline value={get("contact_desc")} onChange={(v) => set("contact_desc", v)} />
              <Field label="Teks tombol WhatsApp" value={get("contact_cta")} onChange={(v) => set("contact_cta", v)} />
            </Section>

            <Section title="SEO">
              <Field label="SEO Title" hint="judul di tab browser & Google" value={get("seo_title")} onChange={(v) => set("seo_title", v)} />
              <Field label="SEO Description" hint="deskripsi di hasil pencarian Google" multiline value={get("seo_description")} onChange={(v) => set("seo_description", v)} />
            </Section>

            <div className="flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-mint hover:bg-mint/90 disabled:opacity-60 text-navy-deep font-semibold rounded-lg text-sm transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              {saved && <span className="text-sm text-green-500 font-medium">Tersimpan!</span>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
