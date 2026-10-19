"use client";

import { useState, useEffect } from "react";

export function useLocalStorage(key, initial, migrate) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        setValue(migrate ? migrate(parsed) : parsed);
      }
    } catch (err) {
      console.error(`Could not read "${key}"`, err);
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Could not save "${key}"`, err);
    }
  }, [key, value, loaded]);

  return [value, setValue, loaded];
}