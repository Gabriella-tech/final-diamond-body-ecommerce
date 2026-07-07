import { Container, Button } from "../components/UI";
import { Link } from "../router";

export function NotFound({ reason }: { reason?: string }) {
  return (
    <Container className="py-24 sm:py-32 text-center max-w-lg">
      <div className="font-display text-7xl sm:text-8xl font-bold text-[#4A0E16]/15 mb-4">404</div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#222] mb-3">Page not found</h1>
      <p className="text-gray-600 mb-8">
        {reason || "The page you're looking for doesn't exist or has been moved."}
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/"><Button>Back to Home</Button></Link>
        <Link to="/shop"><Button variant="outline">Browse Shop</Button></Link>
      </div>
    </Container>
  );
}
