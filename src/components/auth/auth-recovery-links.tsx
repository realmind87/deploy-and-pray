import Link from "next/link";

type AuthRecoveryLinksProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AuthRecoveryLinks({ className = "", onNavigate }: AuthRecoveryLinksProps) {
  return (
    <p className={`text-center text-sm text-zinc-500 dark:text-zinc-400 ${className}`}>
      <Link href="/login/find-username" onClick={onNavigate} className="hover:underline">
        아이디 찾기
      </Link>
      <span aria-hidden="true" className="mx-2">
        ·
      </span>
      <Link href="/login/forgot-password" onClick={onNavigate} className="hover:underline">
        비밀번호 찾기
      </Link>
    </p>
  );
}
