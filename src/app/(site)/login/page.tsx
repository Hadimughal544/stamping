import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Breadcrumb, PageTitle } from "@/components/Breadcrumb";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const { expired } = await searchParams;

  return (
    <>
      <Breadcrumb />
      <PageTitle>Log In</PageTitle>
      <div className="mx-auto mb-16 max-w-[650px] px-4">
        <div className="bg-[#ececec] py-4 text-center font-serif text-[25px] text-[#222]">
          Only single user Log In allowed at a time.
        </div>
        <div className="bg-card px-10 pt-12 pb-16 max-sm:px-4">
          {expired && (
            <p className="mb-6 text-center text-[15px] text-danger">
              Your session has ended. You may have logged in from another place.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </>
  );
}
