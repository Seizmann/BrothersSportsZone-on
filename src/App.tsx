import { MotionConfig } from "motion/react";
import { useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import HighlightsStrip from "./components/HighlightsStrip";
import Wishlist from "./components/Wishlist";
import Footer from "./components/Footer";
import { useWishlistCount } from "./hooks/useWishlistCount";

export default function App() {
  // Lifted so every "Join the wishlist" CTA on the page opens the same sheet.
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const openWishlist = () => setWishlistOpen(true);

  // One live count, shared by every CTA that shows it. The +1 bump fires
  // only on a server-confirmed submission (see useWishlistSubmit).
  const { count, increment } = useWishlistCount();

  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero onJoinWishlist={openWishlist} joinedCount={count} />
        <HighlightsStrip />
        <Wishlist
          open={wishlistOpen}
          onOpen={openWishlist}
          onClose={() => setWishlistOpen(false)}
          joinedCount={count}
          onConfirmed={increment}
        />
      </main>
      <Footer />
    </MotionConfig>
  );
}
