import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/(site)/login/actions";
import { Logo } from "./Logo";
import { DummyLink } from "./DummyLink";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="flex min-h-[137px] items-start justify-between bg-brand px-5 pt-5 pb-4">
      <Logo />
      <nav className="pt-0 text-[17px] leading-[26px] text-white">
        {user ? (
          <ul>
            <li>Hello {user.username}</li>
            <li>
              <DummyLink label="Change Password" />
            </li>
            <li>
              <DummyLink label="User Activity Log" />
            </li>
            <li>
              <form action={logoutAction}>
                <button type="submit" className="cursor-pointer hover:underline">
                  Log off
                </button>
              </form>
            </li>
          </ul>
        ) : (
          <Link href="/login" className="mt-1 inline-block hover:underline">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
