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
    // { href: "/store", label: "Tienda", moduleKey: "tienda" },
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
          ? "bg-white/80 backdrop-blur-xl shadow-md border-b border-white/30"
          : "bg-white"
      }`}
      key={navRef.current}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <NavLink href="/" className="flex items-center space-x-3">
            <img
              src={logoSvg}
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </NavLink>

          {/* Desktop Menu */}
          <div className={`items-center space-x-8 ${isDesktop ? "flex" : "hidden"}`}>
            {navItems.slice(0, 6).map((item) => (
              <NavLink
                key={`${item.href}-${navRef.current}`}
                href={item.href}
                className="text-base font-medium"
              >
                {item.label}
              </NavLink>
            ))}
            {navItems.length > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-base font-medium hover:text-primary">
                  Más
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {navItems.slice(6).map((item) => (
                    <DropdownMenuItem key={item.href} onClick={() => handleNavigation(item.href)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {modules.tienda?.activo && (
              <NavLink
                href="/store"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 hover:bg-gray-100"
              >
                <ShoppingCart className="h-5 w-5" />
              </NavLink>
            )}

            {/* Auth Desktop */}
            <div className={`items-center space-x-3 ${isDesktop ? "flex" : "hidden"}`}>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white/40">
                      <AvatarFallback>
                        {user?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white/90 backdrop-blur-md" align="end">
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
                    className="border border-primary text-primary rounded-md px-4 py-2 hover:bg-primary hover:text-white transition"
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
                className="w-[300px] sm:w-[400px] flex flex-col bg-white backdrop-blur-xl border-l border-gray-200"
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
                </div>

                {/* Auth en Mobile abajo */}
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 rounded-md">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                      <NavLink
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                      >
                        <User className="h-4 w-4" /> Perfil
                      </NavLink>
                      {(user?.role === "admin" || user?.role === "superuser") && (
                        <NavLink
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4" /> Administración
                        </NavLink>
                      )}
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
                        className="block w-full text-center py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition"
                      >
                        Iniciar Sesión
                      </NavLink>
                      <NavLink
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-center py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                      >
                        Registrarse
                      </NavLink>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}