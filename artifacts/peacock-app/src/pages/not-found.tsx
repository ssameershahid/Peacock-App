import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-sage flex items-center justify-center text-forest-500 font-display text-4xl mb-6">404</div>
      <h1 className="font-display text-5xl text-forest-600 mb-4">Wanderlust <span className="italic text-amber-200">misdirected?</span></h1>
      <p className="font-body text-warm-500 text-lg max-w-md mx-auto mb-8">
        We can't seem to find the page you're looking for. It might have been moved or no longer exists.
      </p>
      <Link href="/">
        <Button size="lg" className="h-14 px-8 text-lg">Return to Home</Button>
      </Link>
    </div>
  );
}
