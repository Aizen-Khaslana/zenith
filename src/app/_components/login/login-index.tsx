import { HeroSection } from "./hero-section";
import { SignInSection } from "./sign-in-section";

type LoginIndexProps = {
  nextPath: string;
  hasError: boolean;
};

// Desain 01 (frame 1440): panel kiri 690 dan kanan 750. Pada layar sempit
// formulir masuk tampil lebih dahulu agar tombol terlihat tanpa menggulir.
export function LoginIndex({ nextPath, hasError }: LoginIndexProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[690fr_750fr]">
      <div className="order-2 lg:order-1">
        <HeroSection />
      </div>
      <div className="order-1 lg:order-2">
        <SignInSection nextPath={nextPath} hasError={hasError} />
      </div>
    </main>
  );
}
