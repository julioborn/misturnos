import Link from "next/link";
import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold">Mis Turnos</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Iniciá sesión para reservar tu cancha
        </p>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signIn} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next ?? "/"} />
          <input
            type="text"
            inputMode="numeric"
            name="dni"
            placeholder="DNI"
            required
            autoComplete="username"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            autoComplete="current-password"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <button
            type="submit"
            className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-base font-medium text-white active:bg-emerald-700"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-emerald-700">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
