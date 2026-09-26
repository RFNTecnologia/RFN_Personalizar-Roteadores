import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar — Configura" },
    { name: "description", content: "Acesse o painel seguro de preparação de equipamentos." },
    { property: "og:title", content: "Entrar — Configura" },
    { property: "og:description", content: "Acesse o painel seguro de preparação de equipamentos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/" }); }); }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (result.data.session) navigate({ to: "/" }); else setMessage("Confira seu e-mail para confirmar o cadastro.");
  }

  async function google() {
    setBusy(true); setMessage("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setBusy(false); setMessage(result.error.message); return; }
    if (!result.redirected) navigate({ to: "/" });
  }

  return <main className="grid min-h-screen place-items-center bg-background px-4 py-10"><section className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg"><div className="mb-7 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><Wifi /></div><div><h1 className="text-xl font-extrabold">Configura</h1><p className="text-sm text-muted-foreground">Acesso ao painel</p></div></div><form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-1.5 block text-sm font-bold">E-mail</span><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="block"><span className="mb-1.5 block text-sm font-bold">Senha</span><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>{message && <p className="rounded-md bg-muted p-3 text-sm" role="status">{message}</p>}<Button className="w-full" disabled={busy}>{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}</Button></form><div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div><Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>Continuar com Google</Button><Button type="button" variant="link" className="mt-3 w-full" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Criar uma conta" : "Já tenho uma conta"}</Button></section></main>;
}
