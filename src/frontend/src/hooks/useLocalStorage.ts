import { useCallback, useEffect, useState } from "react";

/**
 * A small typed localStorage hook with JSON serialization and safe fallbacks.
 *
 * - Reads the stored value lazily on first render.
 * - Falls back to `initialValue` when the key is missing or the stored JSON is
 *   corrupt (e.g. written by an older schema).
 * - Writes through on every state change.
 * - Syncs across tabs via the `storage` event.
 *
 * @param key          localStorage key.
 * @param initialValue Value used when nothing valid is stored.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      // Corrupt or unreadable value — fall back safely.
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next =
          typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage may be full or disabled — keep the in-memory value.
        }
        return next;
      });
    },
    [key],
  );

  // Keep multiple tabs in sync.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || event.newValue === null) return;
      try {
        setStoredValue(JSON.parse(event.newValue) as T);
      } catch {
        // Ignore malformed cross-tab updates.
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  return [storedValue, setValue];
}
