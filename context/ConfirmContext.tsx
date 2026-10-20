"use client";

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ConfirmOptions } from "@/types";

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * App-wide "are you sure?" for approve / reject / delete actions:
 * `if (!(await confirm({ title, message }))) return;` before the request.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);
  const accept = useCallback(() => settle(true), [settle]);
  const dismiss = useCallback(() => settle(false), [settle]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={options !== null}
        title={options?.title ?? ""}
        message={options?.message ?? ""}
        details={options?.details}
        confirmLabel={options?.confirmLabel}
        tone={options?.tone ?? "default"}
        onConfirm={accept}
        onCancel={dismiss}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used within a ConfirmProvider");
  return confirm;
}
