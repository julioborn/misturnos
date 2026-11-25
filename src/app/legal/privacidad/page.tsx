import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad — Mis Turnos",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Política de Privacidad</h1>
      <p className="mt-1 text-sm text-muted-foreground">Última actualización: noviembre de 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-base font-semibold">1. Responsable</h2>
          <p className="mt-2">
            Mis Turnos es una aplicación para reservar turnos en canchas y otros establecimientos
            deportivos. El contacto para cualquier consulta sobre esta política o tus datos es{" "}
            <a className="underline" href="mailto:julio@estudioborn.com.ar">
              julio@estudioborn.com.ar
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">2. Qué datos recopilamos</h2>
          <p className="mt-2">Cuando creás una cuenta y usás la app, guardamos:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Nombre completo, DNI, teléfono y email, para identificarte frente al establecimiento.</li>
            <li>Tus reservas: establecimiento, cancha, fecha y hora.</li>
            <li>
              Un token de dispositivo, si activás notificaciones, para poder avisarte sobre tus
              turnos.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold">3. Para qué los usamos</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Para gestionar tus reservas y mostrárselas al establecimiento donde jugás.</li>
            <li>Para enviarte notificaciones relacionadas a tus turnos (recordatorios, cancelaciones).</li>
            <li>Para que el establecimiento pueda contactarte si hace falta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold">4. Con quién se comparten</h2>
          <p className="mt-2">
            Tus datos los ve el establecimiento donde reservás (para poder atenderte) y los
            proveedores que usamos para que la app funcione: Supabase (base de datos y
            autenticación) y Google/Firebase (notificaciones push). No vendemos tus datos a
            terceros ni los usamos con fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">5. Cuánto tiempo los conservamos</h2>
          <p className="mt-2">
            Mientras tu cuenta esté activa. Si eliminás tu cuenta, tu perfil y datos personales se
            borran según se explica en{" "}
            <Link className="underline" href="/legal/eliminar-cuenta">
              Eliminar cuenta y datos
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">6. Tus derechos</h2>
          <p className="mt-2">
            Podés acceder, corregir o eliminar tus datos en cualquier momento. Para eliminar tu
            cuenta, ingresá a la app y entrá a &quot;Cuenta&quot;, o escribinos a{" "}
            <a className="underline" href="mailto:julio@estudioborn.com.ar">
              julio@estudioborn.com.ar
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">7. Cambios a esta política</h2>
          <p className="mt-2">
            Si cambiamos esta política de forma relevante, lo vamos a avisar dentro de la app.
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link className="underline" href="/legal/soporte">
          Soporte
        </Link>
        <Link className="underline" href="/legal/eliminar-cuenta">
          Eliminar cuenta y datos
        </Link>
      </div>
    </div>
  );
}
