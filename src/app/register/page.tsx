import Link from "next/link";
import { signUp } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold">Creá tu cuenta</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Con una cuenta reservás en cualquier cancha asociada. Vas a entrar con tu DNI.
        </p>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signUp} className="flex flex-col gap-3">
          <input
            type="text"
            name="full_name"
            placeholder="Nombre y apellido"
            required
            autoComplete="name"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            type="text"
            inputMode="numeric"
            name="dni"
            placeholder="DNI (sin puntos)"
            required
            pattern="\d{7,8}"
            title="7 u 8 números, sin puntos"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Teléfono (opcional)"
            autoComplete="tel"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            type="email"
            name="email"
            placeholder="Email (para avisos, no para entrar)"
            required
            autoComplete="email"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            minLength={6}
            autoComplete="new-password"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <button
            type="submit"
            className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-base font-medium text-white active:bg-emerald-700"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-emerald-700">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
