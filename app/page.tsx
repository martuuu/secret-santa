import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-bold">
            <span className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent animate-pulse">
              🎅 Secret Santa
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-xl mx-auto">
            Organiza tu intercambio de regalos con{" "}
            <span className="text-yellow-400 font-semibold">privacidad total</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/register">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg px-8"
              >
                Comenzar
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-red-500/50 text-red-400 hover:bg-red-950/50 text-lg px-8"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="p-6 rounded-lg bg-slate-900/50 backdrop-blur border border-red-900/20">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Privacidad Garantizada</h3>
              <p className="text-slate-400 text-sm">
                Nadie puede descubrir quién le regala, ni siquiera inspeccionando la red
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-slate-900/50 backdrop-blur border border-red-900/20">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">QR Challenge</h3>
              <p className="text-slate-400 text-sm">
                Juega a adivinar quién es tu Santa escaneando códigos QR
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-slate-900/50 backdrop-blur border border-red-900/20">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Lista de Deseos</h3>
              <p className="text-slate-400 text-sm">
                Comparte tus ideas de regalos con tu Amigo Invisible
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
