import StudioNavbar from "@/components/studio/StudioNavbar";
import StudioHero from "@/components/studio/StudioHero";
import StudioAbout from "@/components/studio/StudioAbout";
import StudioTemplates from "@/components/studio/StudioTemplates";
import StudioPortfolio from "@/components/studio/StudioPortfolio";
import StudioContact from "@/components/studio/StudioContact";
import StudioFooter from "@/components/studio/StudioFooter";
import { getSettings } from "@/lib/site-settings";
import { getPortfolioItems } from "@/lib/public-data";
import { getTemplateById } from "@/lib/template-library";
import "./studio-redesign.css";

export const revalidate = 0;

export default async function Home() {
  const [settings, portfolioItems] = await Promise.all([getSettings(), getPortfolioItems()]);
  const demoTemplates = ["casa-braci-heritage-001", "dapur-pesisir-tropical-001"].map(getTemplateById).filter(Boolean);
  return (
    <div className="pg-home">
      <StudioNavbar />
      <main id="main-content">
        <StudioHero />
        <StudioAbout demoTemplates={demoTemplates} />
        <StudioTemplates />
        <StudioPortfolio dbItems={portfolioItems} />
        <StudioContact settings={settings} />
      </main>
      <StudioFooter />
    </div>
  );
}
