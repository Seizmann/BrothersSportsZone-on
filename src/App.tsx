import { MotionConfig } from "motion/react";
import { useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import HighlightsStrip from "./components/HighlightsStrip";
import Wishlist from "./components/Wishlist";
import Footer from "./components/Footer";

export default function App() {
  // Lifted so every "Join the wishlist" CTA on the page opens the same sheet.
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const openWishlist = () => setWishlistOpen(true);

  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero onJoinWishlist={openWishlist} />
        <HighlightsStrip />
        <Wishlist open={wishlistOpen} onOpen={openWishlist} onClose={() => setWishlistOpen(false)} />
      </main>
      <Footer />
    </MotionConfig>
  );
}
