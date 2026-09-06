import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";
import { FacebookIcon, InstagramIcon } from "./icons";

export const FACEBOOK_URL = "https://www.facebook.com/share/19UiSqoLae/";
export const INSTAGRAM_URL = "https://www.instagram.com/brothers_sports_zone_faridpur";

export function SocialLinks({ onDark = false }: { onDark?: boolean }) {
  const linkCls = `inline-flex size-11 items-center justify-center rounded-full transition-colors ${
    onDark
      ? "text-canvas hover:bg-line-white/10"
      : "text-ink hover:bg-canvas-soft"
  }`;
  return (
    <div className="flex items-center gap-1">
      <a className={linkCls} href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Brother's Sports Zone on Facebook">
        <FacebookIcon className="size-5" />
      </a>
      <a className={linkCls} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Brother's Sports Zone on Instagram">
        <InstagramIcon className="size-5" />
      </a>
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-10 transition-colors duration-300 ${
        scrolled
          ? "bg-canvas/90 shadow-none backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex h-16 max-w-6xl items-center justify-between px-6 transition-colors duration-300 ${
          scrolled ? "text-ink" : "text-canvas on-dark"
        }`}
        aria-label="Main"
      >
        <a href="#" aria-label="Brother's Sports Zone — back to top" className="rounded-sm">
          {scrolled ? <Wordmark /> : <Wordmark onDark />}
        </a>
        <SocialLinks onDark={!scrolled} />
      </nav>
    </header>
  );
}
