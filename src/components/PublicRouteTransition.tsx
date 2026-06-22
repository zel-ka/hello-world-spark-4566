import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { StartupScreen } from "@/components/StartupScreen";

interface Props {
  children: React.ReactNode;
}

/**
 * Shows the StartupScreen briefly when navigating between public pages
 * (landing, about, features, contact, shop, try). Does not affect
 * authenticated app routes.
 */
export function PublicRouteTransition({ children }: Props) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const firstRender = useRef(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      prevPath.current = location.pathname;
      return;
    }
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    setLoading(true);
  }, [location.pathname]);

  return (
    <>
      {children}
      {loading && (
        <StartupScreen
          minDurationMs={700}
          onDone={() => setLoading(false)}
        />
      )}
    </>
  );
}
