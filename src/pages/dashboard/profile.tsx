import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-sm font-bold uppercase text-primary">VyonixPay account</p>
      <h1 className="mt-2 text-3xl font-bold">My Profile</h1>
      <p className="mt-2 text-muted-foreground">Your VyonixPay account details.</p>

      <div className="mt-8 rounded-md border bg-background p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Avatar className="size-24 border">
            <AvatarFallback className="bg-secondary text-2xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {user.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role.replace("ROLE_", "")}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input readOnly value={user.email} className="cursor-not-allowed bg-secondary/40" />
          </div>
          <div className="space-y-2">
            <Label>Account ID</Label>
            <Input readOnly value={String(user.userId)} className="cursor-not-allowed bg-secondary/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
