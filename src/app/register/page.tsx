import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { signUp } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <DotPattern className="[mask-image:radial-gradient(ellipse_60%_60%_at_center,black,transparent)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <Logo size={56} showText={false} />

        <Card className="relative w-full overflow-hidden">
          <BorderBeam duration={8} size={120} colorFrom="#18181b" colorTo="#a1a1aa" />
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Creá tu cuenta</CardTitle>
            <CardDescription>
              Con una cuenta reservás en cualquier cancha asociada. Vas a entrar con tu DNI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form action={signUp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full_name">Nombre y apellido</Label>
                <Input id="full_name" name="full_name" required autoComplete="name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  name="dni"
                  placeholder="Sin puntos"
                  required
                  pattern="\d{7,8}"
                  title="7 u 8 números, sin puntos"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input id="phone" type="tel" name="phone" autoComplete="tel" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" placeholder="Para avisos, no para entrar" required autoComplete="email" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="mt-2 w-full">
                Crear cuenta
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
                Iniciá sesión
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Al crear tu cuenta aceptás nuestra{" "}
              <Link href="/legal/privacidad" className="underline underline-offset-4">
                Política de Privacidad
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
