import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { consumeAuthRedirect, getSpaceClient, SPACES } from "@/lib/spaces";
import { translateError, Wordmark } from "@/components/SpaceAuth";
import { MainNav } from "@/components/MainNav";
import { PasswordField } from "@/components/PasswordField";
import { PublicBackdrop } from "@/components/PublicBackdrop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مداوروس — فضاء التلاميذ" },
      {
        name: "description",
        content: "منصة مداوروس: فضاء التلاميذ للدخول المباشر إلى الدروس والواجبات.",
      },
      { property: "og:title", content: "مداوروس — فضاء التلاميذ" },
      {
        property: "og:description",
        content: "سجّل الدخول إلى فضاء التلاميذ على منصة مداوروس.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PublicBackdrop>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 pb-16 pt-24">
        <MainNav space="talameed" />
<StudentLogin />

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/taleem" className="underline underline-offset-4 hover:text-foreground">
            وصول الأساتذة
          </Link>
          <span className="text-border">|</span>
          <Link to="/admin" className="underline underline-offset-4 hover:text-foreground">
            وصول الإدارة
          </Link>
        </div>
      </main>
    </PublicBackdrop>
  );
}

function StudentLogin() {
  const navigate = useNavigate();
  const client = getSpaceClient("talameed");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    consumeAuthRedirect(client).then(() =>
      client.auth.getSession().then(({ data }) => {
        if (data.session) navigate({ to: "/talameed" });
      }),
    );
  }, [client, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error: err } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/talameed`,
          data: { space: "talameed" },
        },
      });
      if (err) setError(translateError(err.message));
      else setMessage("تم إنشاء الحساب. حسابك في انتظار مصادقة المشرف العام.");
    } else {
      const { error: err } = await client.auth.signInWithPassword({ email, password });
      if (err) {
        setError(translateError(err.message));
      } else {
        navigate({ to: "/talameed" });
      }
    }

    setBusy(false);
  };

  return (
<div className="w-full max-w-[450px] rounded-[28px] border border-border bg-card/95 px-8 py-10 shadow-lg backdrop-blur-sm sm:px-11">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Wordmark space="talameed" />
        <span className="text-xs tracking-wide text-muted-foreground" dir="ltr">
          {SPACES.talameed.host}
        </span>
      </div>
      <h1 className="text-center text-2xl font-normal text-foreground">
        {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">{SPACES.talameed.subtitle}</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="field">
          <input
            id="email"
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            className="field-input"
            autoComplete="email"
          />
          <label htmlFor="email" className="field-label">
            البريد الإلكتروني
          </label>
        </div>

        <PasswordField
          id="password"
          name="password"
          label="كلمة المرور"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />


        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="btn-text"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
          >
            {mode === "login" ? "إنشاء حساب" : "لدي حساب بالفعل"}
          </button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "…" : mode === "login" ? "التالي" : "تسجيل"}
          </button>
        </div>
      </form>
    </div>
  );
}
