import Wordmark from "./Wordmark";
import { SocialLinks } from "./Nav";

export default function Footer() {
  return (
    <footer className="on-dark bg-ink text-canvas">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center sm:py-16">
        <Wordmark onDark />
        <p className="text-body-md text-mute">Faridpur, Bangladesh</p>
        <SocialLinks onDark />
        <p className="text-caption text-mute">
          &copy; {new Date().getFullYear()} Brother&rsquo;s Sports Zone. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
