import { MotionConfig } from "motion/react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import HighlightsStrip from "./components/HighlightsStrip";
import Wishlist from "./components/Wishlist";
import Footer from "./components/Footer";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <HighlightsStrip />
        <Wishlist />
      </main>
      <Footer />
    </MotionConfig>
  );
}
