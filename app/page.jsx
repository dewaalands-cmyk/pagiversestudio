import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import Clients from "@/components/Clients";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/site-settings";
import { getPortfolioItems, getApprovedTestimonies, getPublicClientNames } from "@/lib/public-data";

export default async function Home() {
  const [settings, portfolioItems, testimonies, clientNames] = await Promise.all([
    getSettings(),
    getPortfolioItems(),
    getApprovedTestimonies(),
    getPublicClientNames(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero settings={settings} />
        <About settings={settings} />
        <Services settings={settings} />
        <Portfolio settings={settings} dbItems={portfolioItems} />
        <Testimonials dbItems={testimonies} />
        <Clients clientNames={clientNames} />
        <Pricing />
        <Contact settings={settings} />
      </main>
      <Footer />
    </>
  );
}
