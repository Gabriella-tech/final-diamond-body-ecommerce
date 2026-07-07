import { useEffect } from "react";
import { findNationBySlug, setActiveNation } from "../data/nations";
import { useRouter } from "../router";
import { Home } from "./Home";
import { NotFound } from "./NotFound";

/**
 * CHANGE 2 — Nation landing pages.
 *
 * Customer visits /vision-nation (or any of the 8 nation slugs).
 * We silently save the Nation in localStorage and render the regular Home page.
 * The customer NEVER sees a Nation selector. Every order placed during this
 * session will automatically be attributed to that Nation.
 */
export function NationLanding({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const nation = findNationBySlug(slug);

  useEffect(() => {
    if (nation) {
      setActiveNation(nation.slug);
      // Replace URL with "/" so the user never sees the nation slug again.
      // Use a tiny delay so the effect doesn't fight initial render.
      const t = setTimeout(() => navigate("/"), 50);
      return () => clearTimeout(t);
    }
  }, [nation, navigate]);

  if (!nation) return <NotFound reason="That Nation link doesn't exist."/>;

  // Render the homepage in the meantime — no Nation selector shown.
  return <Home/>;
}
