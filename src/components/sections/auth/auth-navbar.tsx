import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AuthNavbar = () => {
    return (
        <header className="w-full md:top-10 top-6 mx-auto absolute z-40">
            <Container className="flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 xl:w-[25%] md:w-[30%] w-fit text-foreground">
                    <img src="/images/common/logo.svg" alt="Swedox" className="h-6" />
                    <span className="font-semibold text-xl tracking-tight hidden sm:inline uppercase">Swedox</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-8 text-white/70">
                    <Link to="/about" className="hover:text-white transition-colors">About</Link>
                    <Link to="/feature" className="hover:text-white transition-colors">Features</Link>
                </nav>

                <div className="flex gap-6 items-center lg:w-[25%] justify-end">
                    <Link to="/login" className="text-white hover:text-white/80 transition-colors hidden sm:block">
                        Login
                    </Link>
                    <Button asChild>
                        <Link to="/signup">Open Account</Link>
                    </Button>
                </div>
            </Container>
        </header>
    );
};

export default AuthNavbar;
