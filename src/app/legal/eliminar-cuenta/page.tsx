import Link from "next/link";

export const metadata = {
  title: "Eliminar cuenta y datos — Mis Turnos",
};

export default function EliminarCuentaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Eliminar cuenta y datos</h1>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-base font-semibold">Desde la app</h2>
          <p className="mt-2">
            Iniciá sesión, entrá a <strong>Cuenta</strong> y tocá <strong>Eliminar mi cuenta</strong>.
            La baja es inmediata y no se puede deshacer.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Qué se elimina</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Tu perfil: nombre, DNI, teléfono y email.</li>
            <li>Tus credenciales de acceso (no vas a poder volver a entrar con esa cuenta).</li>
            <li>Los tokens de notificaciones de tus dispositivos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold">Qué conserva el establecimiento</h2>
          <p className="mt-2">
            El establecimiento donde reservaste turnos conserva el registro histórico de esas
            reservas (fecha, cancha, horario) para sus propios fines administrativos y contables,
            pero sin tu nombre ni datos de contacto asociados, ya que tu perfil fue eliminado.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold">Si no podés acceder a tu cuenta</h2>
          <p className="mt-2">
            Escribinos a{" "}
            <a className="underline" href="mailto:julio@estudioborn.com.ar">
              julio@estudioborn.com.ar
            </a>{" "}
            pidiendo la baja, indicando tu DNI o el email con el que te registraste. Procesamos la
            solicitud en un plazo de hasta 15 días hábiles.
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link className="underline" href="/legal/privacidad">
          Política de Privacidad
        </Link>
        <Link className="underline" href="/legal/soporte">
          Soporte
        </Link>
      </div>
    </div>
  );
}
