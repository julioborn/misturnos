import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    : { data: null };

  const { data: establishments } = await supabase
    .from("establishments")
    .select("id,name,slug,description,address")
    .eq("active", true)
    .order("name");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold">
          ¡Hola{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-sm text-muted-foreground">Elegí dónde querés jugar</p>
      </div>

      <div className="flex flex-col gap-3">
        {(establishments ?? []).map((e) => (
          <Link key={e.id} href={`/establecimientos/${e.slug}`}>
            <Card className="transition-colors hover:bg-accent/40">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{e.name}</CardTitle>
                  {e.address && (
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {e.address}
                    </CardDescription>
                  )}
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </CardHeader>
              {e.description && (
                <CardContent className="pt-0 text-sm text-muted-foreground">{e.description}</CardContent>
              )}
            </Card>
          </Link>
        ))}

        {(establishments ?? []).length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Todavía no hay establecimientos disponibles.
          </p>
        )}
      </div>
    </div>
  );
}
