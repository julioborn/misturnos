import Link from "next/link";

export const metadata = {
  title: "Soporte — Mis Turnos",
};

export default function SoportePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Soporte</h1>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground">
        <section>
          <p>
            Si tenés un problema con la app, una duda sobre una reserva o encontraste algo que no
            funciona bien, escribinos a:
          </p>
          <p className="mt-2 text-base font-semibold">
            <a className="underline" href="mailto:julio@estudioborn.com.ar">
              julio@estudioborn.com.ar
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Contanos</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Qué estabas tratando de hacer.</li>
            <li>Qué pasó (si hay un mensaje de error, copialo o mandá una captura).</li>
            <li>Con qué cuenta (email) estás usando la app.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold">Tiempo de respuesta</h2>
          <p className="mt-2">Normalmente respondemos dentro de 48 horas hábiles.</p>
        </section>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link className="underline" href="/legal/privacidad">
          Política de Privacidad
        </Link>
        <Link className="underline" href="/legal/eliminar-cuenta">
          Eliminar cuenta y datos
        </Link>
      </div>
    </div>
  );
}
