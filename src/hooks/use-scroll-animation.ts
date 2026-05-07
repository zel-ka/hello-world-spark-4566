import { useEffect, useCallback } from "react";

export function useScrollAnimation() {
  const observe = useCallback((container: HTMLElement | null) => {
    if (!container) return;

    const targets = container.querySelectorAll(
      ".scroll-fade-in, .scroll-scale-in, .scroll-slide-left, .scroll-slide-right"
    );

    // Make all visible immediately if IntersectionObserver not ideal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    // Also trigger visible for elements already in viewport
    requestAnimationFrame(() => {
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add("visible");
        }
      });
    });

    return () => observer.disconnect();
  }, []);

  return observe;
}
