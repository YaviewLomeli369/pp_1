import { Spinner } from "@/components/ui/spinner";
import { Navbar } from "@/components/layout/navbar"

export function LoadingPage({ message = "Cargando..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center" style={{ contentVisibility: 'auto' }}>
      <Navbar />
      <div className="flex flex-col items-center space-y-4 flex-1 justify-center navbar-fixed-body">
        <Spinner size="lg" className="text-primary" />
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{message}</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Por favor espere mientras cargamos el contenido.
          </p>
        </div>
      </div>
    </div>
  );
}