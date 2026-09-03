import DynamicIsland from "@/components/layout/DynamicIsland";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ScrollRail from "@/components/layout/ScrollRail";
import MobileDock from "@/components/layout/MobileDock";
import Cursor from "@/components/layout/Cursor";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Review from "@/components/sections/Review";
import Proof from "@/components/sections/Proof";
import Services from "@/components/sections/Services";
import Safety from "@/components/sections/Safety";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";
import { BookingProvider } from "@/components/booking/BookingContext";

/**
 * Section order follows the story, not the service list:
 *   name the fear → show the whole free scope → prove it with a real finding →
 *   offer the ladder → answer the fear about us → answer everything else → ask.
 */
export default function Page() {
  return (
    <BookingProvider>
      <a
        href="#review"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-vellum focus:px-5 focus:py-3 focus:text-ink-900"
      >
        Skip to content
      </a>

      <SmoothScroll />
      <ScrollRail />
      <DynamicIsland />
      <MobileDock />
      <Cursor />

      <main>
        <Hero />
        <Review />
        <Proof />
        <Services />
        <Safety />
        <Faq />
        <Contact />
      </main>

      <Footer />
    </BookingProvider>
  );
}
