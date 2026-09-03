"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

const BookingModal = dynamic(() => import("@/components/booking/BookingModal"), { ssr: false });
const HireModal = dynamic(() => import("@/components/booking/HireModal"), { ssr: false });

interface BookingState {
  open: boolean;
  /** Which service the visitor came from, if any. Pre-fills the modal. */
  interest: string | null;
  openBooking: (interest?: string) => void;
  closeBooking: () => void;
  /** The second path: hiring us directly. Separate sheet, separate copy. */
  hireOpen: boolean;
  hireService: string | null;
  openHire: (service?: string) => void;
  closeHire: () => void;
}

const Ctx = createContext<BookingState | null>(null);

/**
 * One booking modal for the whole page. Every "book" button on the site
 * opens the same sheet, so there is one form to reason about and one place
 * to wire the submission logic later.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState<string | null>(null);

  const openBooking = useCallback((i?: string) => {
    setInterest(i ?? null);
    setOpen(true);
  }, []);
  const closeBooking = useCallback(() => setOpen(false), []);

  const [hireOpen, setHireOpen] = useState(false);
  const [hireService, setHireService] = useState<string | null>(null);
  const openHire = useCallback((s?: string) => {
    setHireService(s ?? null);
    setOpen(false);
    setHireOpen(true);
  }, []);
  const closeHire = useCallback(() => setHireOpen(false), []);

  const value = useMemo(
    () => ({ open, interest, openBooking, closeBooking, hireOpen, hireService, openHire, closeHire }),
    [open, interest, openBooking, closeBooking, hireOpen, hireService, openHire, closeHire],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <BookingModal />
      <HireModal />
    </Ctx.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
