import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = user.email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-10 w-10 border-2 border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
          <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card border-white/10 z-50"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground">Hi, {displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
          <Link to="/dashboard/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
            <Link to="/dashboard/admin" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
