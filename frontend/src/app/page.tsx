import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper px-5 py-8 text-ink">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ember">VedaAI</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
          AI Assessment Platform for modern teachers.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
          Create assignments, generate structured question papers, and prepare a smarter
          assessment workflow for your classroom.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <SignedOut>
            <SignInButton mode="redirect">
              <button className="btn-primary" type="button">Sign in</button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="btn-secondary" type="button">Create account</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn-primary">Open workspace</Link>
          </SignedIn>
        </div>
      </section>
    </main>
  );
}
