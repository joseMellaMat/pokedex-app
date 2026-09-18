import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll(FOCUSABLE_SELECTOR);
  return Array.from(nodes).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}

export function useModalFocus(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  initialFocusRef: RefObject<HTMLElement | null>,
): void {
  const savedElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    savedElementRef.current = document.activeElement;
    const container = containerRef.current;
    if (container !== null) {
      if (initialFocusRef.current !== null) {
        initialFocusRef.current.focus();
      } else {
        const focusables = getFocusableElements(container);
        if (focusables[0] !== undefined) {
          focusables[0].focus();
        } else {
          container.focus();
        }
      }
    }
    return () => {
      const previous = savedElementRef.current;
      if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [isOpen, containerRef, initialFocusRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Tab") {
        return;
      }
      const container = containerRef.current;
      if (container === null) {
        return;
      }
      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (first === undefined || last === undefined) {
        return;
      }
      const active = document.activeElement;
      if (!container.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, containerRef]);
}
