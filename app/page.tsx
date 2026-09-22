import Providers from "./components/Providers";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import Marquee from "./components/Marquee";
import Services from "./components/Services";
import PersonalBranding from "./components/PersonalBranding";
import Testimonials from "./components/Testimonials";
import Stats from "./components/Stats";
import Founder from "./components/Founder";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <Providers>
      <Nav />
      <main className="relative">
        <Hero />
        <Manifesto />
        <Marquee />
        <Services />
        <PersonalBranding />
        <Testimonials />
        <Stats />
        <Founder />
        <Contact />
      </main>
    </Providers>
  );
}
