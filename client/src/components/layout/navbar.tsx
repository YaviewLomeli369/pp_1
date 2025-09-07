import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { SiteConfig } from "@shared/schema";

import logoSvg from "/imgs/NYUXO_LOGO_CLARO.svg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingCart, User, LogOut, Settings, Menu } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1075);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(`navbar-${Date.now()}`);
  const isNavigatingRef = useRef(false);

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const configData = config?.config as any;
  const modules = configData?.frontpage?.modulos || {};
  const appearance = configData?.appearance || {};

  const navItems = [
    { href: "/", label: "Inicio", always: true },
    { href: "/testimonials", label: "Testimonios", moduleKey: "testimonios" },
    { href: "/faqs", label: "FAQs", moduleKey: "faqs" },
    { href: "/contact", label: "Contacto", moduleKey: "contacto" },
    { href: "/store", label: "Tienda", moduleKey: "tienda" },
    { href: "/blog", label: "Blog", moduleKey: "blog" },
    { href: "/reservations", label: "Reservas", moduleKey: "reservas" },
    { href: "/conocenos", label: "Conócenos", always: true },
    { href: "/servicios", label: "Servicios", always: true }
  ].filter(item => item.always || (item.moduleKey && modules[item.moduleKey]?.activo));

  const handleNavigation = useCallback((href: string) => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    document.body.classList.remove("modal-open", "overflow-hidden");
    document.body.style.overflow = "";

    if (href === location) {
      const refreshHref = `${href}?refresh=${Date.now()}`;
      window.history.replaceState(null, "", href);
      setLocation(refreshHref);
      setTimeout(() => setLocation(href), 50);
    } else {
      setLocation(href);
    }

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [location, setLocation]);

  useEffect(() => {
    const handleResize = () => {
      const newIsDesktop = window.innerWidth > 1075;
      if (isMobileMenuOpen && newIsDesktop) setIsMobileMenuOpen(false);
      setIsDesktop(newIsDesktop);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileMenuOpen]);

  const NavLink = useCallback(({ href, children, className, onClick }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <div
      className={`cursor-pointer ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick();
        handleNavigation(href);
      }}
      style={isNavigatingRef.current ? { pointerEvents: "none", opacity: 0.6 } : {}}
    >
      <span
        className={`${
          location === href
            ? "text-primary font-semibold"
            : "text-gray-800 hover:text-primary"
        } transition-colors`}
      >
        {children}
      </span>
    </div>
  ), [handleNavigation, location]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all ${
        isScrolled
          ? "bg-white/60 backdrop-blur-xl shadow-md border-b border-white/30"
          : "bg-white/40 backdrop-blur-xl"
      }`}
      key={navRef.current}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <NavLink href="/" className="flex items-center space-x-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-md p-1">
              <img
                src={logoSvg}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900">
              {appearance.brandName || "Sistema Modular"}
            </span>
          </NavLink>

          {/* Desktop Menu */}
          <div className={`items-center space-x-8 ${isDesktop ? "flex" : "hidden"}`}>
            {navItems.map((item) => (
              <NavLink
                key={`${item.href}-${navRef.current}`}
                href={item.href}
                className="text-base font-medium"
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {modules.tienda?.activo && (
              <NavLink
                href="/store"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 hover:bg-gray-100/60 backdrop-blur-sm"
              >
                <ShoppingCart className="h-5 w-5" />
              </NavLink>
            )}

            {/* Auth Desktop */}
            <div className={`items-center space-x-3 ${isDesktop ? "flex" : "hidden"}`}>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white/40 backdrop-blur-sm">
                      <AvatarFallback>
                        {user?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 backdrop-blur-md bg-white/80" align="end">
                    <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                      <User className="mr-2 h-4 w-4" /> Perfil
                    </DropdownMenuItem>
                    {(user?.role === "admin" || user?.role === "superuser") && (
                      <DropdownMenuItem onClick={() => handleNavigation("/admin")}>
                        <Settings className="mr-2 h-4 w-4" /> Administración
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <NavLink href="/login" className="text-gray-700 hover:text-primary">
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    href="/register"
                    className="bg-primary/80 text-white rounded-md px-4 py-2 hover:bg-primary/90 backdrop-blur-sm"
                  >
                    Registrarse
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <div
                  className={`inline-flex items-center justify-center h-9 px-3 cursor-pointer ${
                    isDesktop ? "hidden" : "block"
                  }`}
                >
                  <Menu className="h-6 w-6" />
                </div>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] flex flex-col bg-white/50 backdrop-blur-xl border-l border-white/30"
              >
                <SheetHeader>
                  <SheetTitle>{appearance.brandName || "Sistema Modular"}</SheetTitle>
                  <SheetDescription>Navegación principal</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6 overflow-y-auto flex-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={`mobile-${item.href}-${navRef.current}`}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-lg font-medium p-2 rounded-md ${
                        location === item.href
                          ? "text-primary bg-primary/10"
                          : "text-gray-700 hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  {/* Auth en Mobile */}
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-white/60 rounded-md backdrop-blur-sm">
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                        </div>
                        <NavLink
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 p-2 rounded-md"
                        >
                          <User className="h-4 w-4" /> Perfil
                        </NavLink>
                        <div
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700 p-2 rounded-md cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" /> Cerrar Sesión
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <NavLink
                          href="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block w-full text-center py-2 px-4 bg-gray-100/60 backdrop-blur-sm text-gray-700 rounded-md"
                        >
                          Iniciar Sesión
                        </NavLink>
                        <NavLink
                          href="/register"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block w-full text-center py-2 px-4 bg-primary/80 text-white rounded-md hover:bg-primary/90 backdrop-blur-sm"
                        >
                          Registrarse
                        </NavLink>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
