import connectDB from "@/lib/db";

export default async function Home() {
  // Questo comando prova ad aprire la connessione
  await connectDB(); 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
      <h1 className="text-4xl font-bold">Test Connessione</h1>
      <p className="text-xl">
        Stato Database: <span className="text-green-400 font-bold">CONNESSO E PRONTO! 🚀</span>
      </p>
      <p className="text-sm text-gray-400">Ora possiamo iniziare a creare le feste.</p>
    </div>
  );
}