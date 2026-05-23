import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { NotePencil } from "@phosphor-icons/react/dist/ssr";

export default function SignInPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#e5e2dc]">
      <header className="flex h-12 items-center border-b border-stone-800 bg-[#1c1917] px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-amber-600">
            <NotePencil className="h-3.5 w-3.5 text-white" weight="fill" />
          </div>
          <span className="text-sm font-medium text-white">Notely</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md border border-[#cfc9bf] bg-white p-8 md:p-10">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
              Sign in
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Continue to your workspace.
            </p>
          </div>
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        </div>
      </div>
    </main>
  );
}
