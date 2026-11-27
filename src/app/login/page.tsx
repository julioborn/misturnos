import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; eliminada?: string }>;
}) {
  const { error, next, eliminada } = await searchParams;

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <DotPattern className="[mask-image:radial-gradient(ellipse_60%_60%_at_center,black,transparent)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <Logo size={56} showText={false} />

        <Card className="relative w-full overflow-hidden">
          <BorderBeam duration={8} size={120} colorFrom="#18181b" colorTo="#a1a1aa" />
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Mis Turnos</CardTitle>
            <CardDescription>Iniciá sesión para reservar tu cancha</CardDescription>
          </CardHeader>
          <CardContent>
            {eliminada && !error && (
              <Alert className="mb-4">
                <AlertDescription>Tu cuenta fue eliminada.</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form action={signIn} className="flex flex-col gap-5">
              <input type="hidden" name="next" value={next ?? "/"} />
              <div className="flex flex-col gap-2">
                <Label htmlFor="dni" className="text-base">DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  name="dni"
                  placeholder="Sin puntos"
                  required
                  autoComplete="username"
                  className="h-12 text-base md:text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-base">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="h-12 text-base md:text-base"
                />
              </div>
              <Button type="submit" className="mt-2 h-12 w-full text-base">
                Entrar
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
                Registrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
