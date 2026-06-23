import Providers from "./components/Providers";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import Marquee from "./components/Marquee";
import Services from "./components/Services";
import Work from "./components/Work";
import Stats from "./components/Stats";
import Process from "./components/Process";
import Team from "./components/Team";
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
        <Work />
        <Stats />
        <Process />
        <Team />
        <Contact />
      </main>
    </Providers>
  );
}
