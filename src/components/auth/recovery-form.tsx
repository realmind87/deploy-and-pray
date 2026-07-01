"use client";

import { useActionState } from "react";
import type { RecoveryActionState } from "@/features/auth/recovery-actions";
import { buttonPrimaryFullClass, errorTextClass, successTextClass } from "@/lib/ui-classes";

type RecoveryFormProps = {
  action: (prevState: RecoveryActionState, formData: FormData) => Promise<RecoveryActionState>;
  submitLabel: string;
  children: React.ReactNode;
};

export function RecoveryForm({ action, submitLabel, children }: RecoveryFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state.error && <p className={errorTextClass}>{state.error}</p>}
      {state.success && state.message && <p className={successTextClass}>{state.message}</p>}
      {!state.success && (
        <button type="submit" disabled={pending} className={buttonPrimaryFullClass}>
          {pending ? "처리 중..." : submitLabel}
        </button>
      )}
    </form>
  );
}
