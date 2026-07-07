import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type RouterCtx = {
  path: string;
  navigate: (to: string) => void;
};

const Ctx = createContext<RouterCtx>({ path: "/", navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.hash.replace(/^#/, "") || "/");

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "/";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const value = useMemo(() => ({ path, navigate }), [path]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRouter() {
  return useContext(Ctx);
}

export function Link({
  to,
  className,
  children,
  onClick,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

export function parseRoute(path: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  const segs = pathname.split("/").filter(Boolean);
  return { pathname, segs, params };
}
