import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ScrollableTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollableTableWrapper({
  children,
  className = "",
}: ScrollableTableWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);

  const [showStickyBar, setShowStickyBar] = useState(false);
  const [metrics, setMetrics] = useState({
    left: 0,
    width: 0,
    scrollWidth: 0,
  });

  const updateMetrics = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;

    const hasHorizontalOverflow = scrollWidth > clientWidth + 2;
    const viewportHeight = window.innerHeight;

    // Show the frozen bottom scrollbar when:
    // 1. The table content is wider than the visible table container
    // 2. The top of the table is visible inside the viewport
    // 3. The bottom of the table (where the native scrollbar lives) is below the viewport
    const shouldShow =
      hasHorizontalOverflow &&
      rect.top < viewportHeight - 40 &&
      rect.bottom > viewportHeight;

    setShowStickyBar(shouldShow);

    if (shouldShow) {
      setMetrics((prev) => {
        if (
          Math.abs(prev.left - rect.left) < 1 &&
          Math.abs(prev.width - clientWidth) < 1 &&
          Math.abs(prev.scrollWidth - scrollWidth) < 1
        ) {
          return prev;
        }
        return {
          left: rect.left,
          width: clientWidth,
          scrollWidth,
        };
      });
    }
  }, []);

  // Ensure the frozen scrollbar position matches the table's scrollLeft when shown or resized
  useEffect(() => {
    if (showStickyBar && containerRef.current && stickyBarRef.current) {
      if (
        Math.abs(
          stickyBarRef.current.scrollLeft - containerRef.current.scrollLeft
        ) > 1
      ) {
        stickyBarRef.current.scrollLeft = containerRef.current.scrollLeft;
      }
    }
  }, [showStickyBar, metrics]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateMetrics();
    const timer = setTimeout(updateMetrics, 100);

    // Capture phase catches scroll events on <main> or any scrollable container
    window.addEventListener("scroll", updateMetrics, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", updateMetrics, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateMetrics();
      });
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    const mutationObserver = new MutationObserver(() => {
      updateMetrics();
      if (resizeObserver && el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", updateMetrics, { capture: true });
      window.removeEventListener("resize", updateMetrics);
      if (resizeObserver) resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateMetrics, children]);

  const handleTableScroll = () => {
    const tableEl = containerRef.current;
    const barEl = stickyBarRef.current;
    if (!tableEl || !barEl) return;
    if (Math.abs(barEl.scrollLeft - tableEl.scrollLeft) > 1) {
      barEl.scrollLeft = tableEl.scrollLeft;
    }
  };

  const handleBarScroll = () => {
    const tableEl = containerRef.current;
    const barEl = stickyBarRef.current;
    if (!tableEl || !barEl) return;
    if (Math.abs(tableEl.scrollLeft - barEl.scrollLeft) > 1) {
      tableEl.scrollLeft = barEl.scrollLeft;
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleTableScroll}
        className={`overflow-x-auto ${className}`}
      >
        {children}
      </div>

      {showStickyBar &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={stickyBarRef}
            onScroll={handleBarScroll}
            style={{
              position: "fixed",
              bottom: 0,
              left: `${metrics.left}px`,
              width: `${metrics.width}px`,
              zIndex: 45,
            }}
            className="overflow-x-scroll bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] print:hidden sticky-horizontal-scrollbar"
          >
            <div
              style={{
                width: `${metrics.scrollWidth}px`,
                height: "1px",
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}
