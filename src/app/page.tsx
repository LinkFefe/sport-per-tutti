import connectDB from "@/lib/db";
import Party from "@/models/Party";
import { Home, Package, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AddPartyButton from "@/objects/AddPartyButton";
import DeletePartyButton from "@/objects/DeletePartyButton";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logout } from "@/app/actions";

interface PartyEvent {
  _id: string;
  name: string;
  date: string;
  imageUrl: string;
  location: string;
  description?: string;
}

interface PartyRaw {
  _id: unknown;
  name: string;
  date: Date;
  imageUrl?: string;
  location: string;
  description?: string;
}

async function deleteEvent(id: string) {
  "use server";
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  if (id && isAdmin) {
    await connectDB();
    await Party.findByIdAndDelete(id);
    revalidatePath("/");
  }
}

async function getParties(): Promise<PartyEvent[]> {
  await connectDB();
  const parties = await Party.find().sort({ date: 1 }).lean();

  return (parties as unknown as PartyRaw[]).map((party) => ({
    _id: String(party._id),
    name: party.name,
    date: party.date.toISOString(),
    imageUrl: party.imageUrl || "",
    location: party.location,
    description: party.description,
  }));
}

export default async function Page() {
  const parties = await getParties();

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-6 py-3">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/" className="flex flex-col items-center text-blue-600">
            <Home size={24} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
              Eventi
            </span>
          </Link>

          <Link
            href="/box"
            className="flex flex-col items-center text-gray-400 hover:text-blue-600 transition"
          >
            <Package size={24} />
            <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">
              Boxs
            </span>
          </Link>

          {isAdmin ? (
            <form action={logout}>
              <button
                type="submit"
                className="flex flex-col items-center text-red-400 hover:text-red-600 transition"
              >
                <LogOut size={24} />
                <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">
                  Esci
                </span>
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center text-gray-400 hover:text-blue-600 transition"
            >
              <LogIn size={24} />
              <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">
                Login
              </span>
            </Link>
          )}
        </div>
      </header>

      <main className="pt-24 px-4 max-w-md mx-auto space-y-5">
        <div className="flex justify-between items-start mb-2 h-14">
          <h1 className="text-2xl font-bold text-gray-800 self-center">
            I tuoi Eventi
          </h1>
          {isAdmin && <AddPartyButton count={parties.length} />}
        </div>

        {parties.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <span className="text-3xl">+</span>
            </div>
            <p className="font-medium text-gray-900">Nessun evento</p>
            <p className="text-sm mt-1 mb-4">
              Non hai ancora organizzato nessuna festa.
            </p>
          </div>
        ) : (
          parties.map((party) => (
            <div
              key={party._id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {party.imageUrl ? (
                  <Image
                    src={party.imageUrl}
                    alt={party.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="text-4xl">🎉</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex flex-col items-center z-10">
                  <span className="text-red-500 uppercase text-[10px]">
                    {new Date(party.date).toLocaleDateString("it-IT", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-lg leading-none text-gray-800">
                    {new Date(party.date).toLocaleDateString("it-IT", {
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900 flex-1 pr-2">
                    {party.name}
                  </h2>

                  {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/edit/${party._id}`}
                        className="text-white text-xs bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 shadow-sm font-medium"
                      >
                        ✏️ Modifica
                      </Link>

                      <DeletePartyButton
                        id={party._id}
                        deleteAction={deleteEvent}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <span>📍 {party.location}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {party.description || "Nessun dettaglio aggiuntivo."}
                </p>

                <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <span>
                    ⏰ Ore{" "}
                    {new Date(party.date).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}