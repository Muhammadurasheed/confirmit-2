import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const navItems = [
    { name: "QuickScan", path: "/quick-scan" },
    { name: "Account Check", path: "/account-check" },
    { name: "Business Directory", path: "/business" },
    { name: "API", path: "/api" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Legit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
