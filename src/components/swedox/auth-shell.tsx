import { SwedoxBrand } from "@/components/swedox/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthShellProps {
  mode: "login" | "register";
}

export function AuthShell({ mode }: AuthShellProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!isLogin && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isLogin ? "Log in" : "Create account"} | Swedox</title>
        <meta name="description" content={`${isLogin ? "Log in to" : "Create"} your Swedox account.`} />
      </Helmet>

      <header className="border-b bg-background">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
          <SwedoxBrand />
          <Link className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground" to={isLogin ? "/signup" : "/login"}>
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl lg:grid-cols-[1fr_1.05fr]">
        <section className="hidden border-r bg-secondary px-10 py-20 lg:flex lg:flex-col lg:justify-between">
          <div className="max-w-md">
            <span className="mb-6 inline-flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
            <h1 className="text-4xl font-bold leading-tight">Your finances, handled with care.</h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Manage bills, loan applications, and insurance from one clear, secure place.
            </p>
          </div>
          <div className="space-y-3 text-sm font-medium text-muted-foreground">
            {['Encrypted personal information', 'Clear status updates', 'Simple account controls'].map((item) => (
              <p key={item} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-accent" />{item}</p>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-16 sm:px-10">
          <div className="w-full max-w-md">
            <p className="mb-3 text-sm font-bold uppercase text-primary">{isLogin ? "Welcome back" : "Join Swedox"}</p>
            <h2 className="text-3xl font-bold">{isLogin ? "Log in to your account" : "Create your account"}</h2>
            <p className="mt-3 text-muted-foreground">{isLogin ? "Enter your details to continue." : "Start managing your finances in one place."}</p>

            <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-12 bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="h-12 bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (isLogin ? "Logging in..." : "Creating account...") : (isLogin ? "Log in" : "Create account")}
                <ArrowRight />
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              {isLogin ? "New to Swedox?" : "Already have an account?"}{" "}
              <Link to={isLogin ? "/signup" : "/login"} className="font-bold text-primary hover:underline">
                {isLogin ? "Create account" : "Log in"}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}