import StudioNavbar from "@/components/studio/StudioNavbar";
import StudioHero from "@/components/studio/StudioHero";
import StudioAbout from "@/components/studio/StudioAbout";
import StudioServices from "@/components/studio/StudioServices";
import StudioProcess from "@/components/studio/StudioProcess";
import StudioPortfolio from "@/components/studio/StudioPortfolio";
import StudioTestimonials from "@/components/studio/StudioTestimonials";
import StudioContact from "@/components/studio/StudioContact";
import StudioTestimonialForm from "@/components/studio/StudioTestimonialForm";
import StudioFooter from "@/components/studio/StudioFooter";
import { getSettings } from "@/lib/site-settings";
import { getPortfolioItems, getApprovedTestimonies } from "@/lib/public-data";

// Selalu ambil data terbaru dari DB (portfolio/testimoni) tanpa cache statis
export const revalidate = 0;

export default async function Home() {
  const [settings, portfolioItems, testimonies] = await Promise.all([
    getSettings(),
    getPortfolioItems(),
    getApprovedTestimonies(),
  ]);

  return (
    <>
      <StudioNavbar />
      <main id="main-content">
        <StudioHero settings={settings} />
        <StudioAbout settings={settings} />
        <StudioServices settings={settings} />
        <StudioProcess />
        <StudioPortfolio settings={settings} dbItems={portfolioItems} />
        <StudioTestimonials dbItems={testimonies} />
        <StudioContact settings={settings} />
        <StudioTestimonialForm />
      </main>
      <StudioFooter />
    </>
  );
}
