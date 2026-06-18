import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import TestimonialForm from "@/components/TestimonialForm";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/site-settings";
import { getPortfolioItems, getApprovedTestimonies } from "@/lib/public-data";

export default async function Home() {
  const [settings, portfolioItems, testimonies] = await Promise.all([
    getSettings(),
    getPortfolioItems(),
    getApprovedTestimonies(),
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
        <Pricing />
        <Contact settings={settings} />
        <TestimonialForm />
      </main>
      <Footer />
    </>
  );
}
