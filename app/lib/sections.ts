export const SECTIONS = [
  { id: "top", label: "Bevezető" },
  { id: "manifesto", label: "Kiáltvány" },
  { id: "services", label: "Szolgáltatások" },
  { id: "work", label: "Munkáink" },
  { id: "stats", label: "Hatás" },
  { id: "process", label: "Folyamat" },
  { id: "team", label: "Csapat" },
  { id: "contact", label: "Kapcsolat" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** Smoothly scroll to a section, using Lenis when it's available. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } })
    .__lenis;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}
