"use server";

import connectDB from "@/lib/db";
import Party from "@/models/Party";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import User from "@/models/User";
import { cookies } from "next/headers";

const ADMIN_USER = "admin";
const ADMIN_PASS = "adminpw";
const COOKIE_NAME = "admin_session";

// Corrisponde a MAX_FEEDBACKS nel frontend
const MAX_HISTORY_ITEMS = 20; 

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value === "true";
}

export async function login(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    (await cookies()).set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    redirect("/box");
  } else {
    console.log("Password errata");
  }
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/");
}

export async function createParty(formData: FormData) {
  const isAdmin = await checkAuth();
  if (!isAdmin) {
    throw new Error("Non autorizzato");
  }

  await connectDB();

  const name = formData.get("name")?.toString() || "";
  const date = formData.get("date")?.toString() || "";
  const time = formData.get("time")?.toString() || "";
  const location = formData.get("location")?.toString() || "";
  const description = formData.get("description")?.toString() || undefined;
  const imageUrl = formData.get("imageUrl")?.toString() || undefined;

  const fullDate = new Date(`${date}T${time}`);

  await Party.create({
    name,
    date: fullDate,
    location,
    description,
    imageUrl,
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateParty(formData: FormData) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return;

  await connectDB();

  const id = formData.get("id");
  const name = formData.get("name");
  const date = formData.get("date");
  const time = formData.get("time");
  const location = formData.get("location");
  const description = formData.get("description")?.toString() || undefined;
  const imageUrl = formData.get("imageUrl")?.toString() || undefined;

  const fullDate = new Date(`${date}T${time}`);

  await Party.findByIdAndUpdate(id, {
    name,
    date: fullDate,
    location,
    description,
    imageUrl,
  });

  revalidatePath("/");
  redirect("/");
}

export async function deleteParty(formData: FormData) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return;

  await connectDB();
  const id = formData.get("id");

  await Party.findByIdAndDelete(id);

  revalidatePath("/");
  redirect("/");
}

export async function createUser(formData: FormData) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return;

  await connectDB();

  const name = formData.get("name")?.toString().trim() || "";
  const surname = formData.get("surname")?.toString().trim() || "";

  await User.create({
    name,
    surname,
    quota: 0,
    baseQuota: 0,
    quotaHistory: [],
  });

  revalidatePath("/box");
}

// AZIONE AGGIUSTATA PER SALVARE LO STORICO
export async function updateQuota(userId: string, newQuota: number) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return;

  await connectDB();

  if (newQuota < 0) return;
  
  // Recupera l'utente corrente per calcolare la differenza
  const userDoc = await User.findById(userId).lean();
  if (!userDoc) return;
  
  const oldQuota = Number(userDoc.quota) || 0;
  const difference = newQuota - oldQuota;
  
  const feedback = {
    timestamp: new Date(),
    difference,
    newQuota,
    field: 'quota',
  };
  
  const MAX_HISTORY = 20;
  
  try {
    const res = await User.findByIdAndUpdate(userId, {
      $set: { quota: newQuota },
      $push: { quotaHistory: { $each: [feedback], $position: 0, $slice: MAX_HISTORY } },
    });

    revalidatePath("/box");
    return true;
  } catch (err) {
    console.error("Errore updateQuota:", err);
    return false;
  }
}

export async function deleteUser(formData: FormData) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return;

  await connectDB();
  const id = formData.get("id");
  await User.findByIdAndDelete(id);
  revalidatePath("/box");
}


export async function ensureQuotaHistory() {
  await connectDB();
  // Imposta quotaHistory = [] per i documenti che non hanno il campo
  await User.updateMany({ quotaHistory: { $exists: false } }, { $set: { quotaHistory: [] } });
  // Imposta baseQuota = quota per i documenti che non hanno baseQuota
  await User.updateMany({ baseQuota: { $exists: false } }, [{ $set: { baseQuota: { $ifNull: ["$baseQuota", "$quota"] } } }]);
  revalidatePath("/box");
}

// Aggiorna entrambi i campi baseQuota e quota (se necessario) e registra i feedback
export async function updateQuotas(userId: string, baseQuota: number, newQuota: number) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return false;

  await connectDB();

  console.log('updateQuotas called', { userId, baseQuota, newQuota });

  if (baseQuota < 0 || newQuota < 0) return false;

  const userDoc = await User.findById(userId).lean();
  if (!userDoc) return false;

  const ops: any = { $set: {}, $push: {} };
  const feedbacks: any[] = [];
  // baseQuota
  const oldBase = Number(userDoc.baseQuota ?? userDoc.quota) || 0;
  const oldQuota = Number(userDoc.quota) || 0;

  // If either value changed, create a single feedback entry that records both values
  const changedBase = baseQuota !== oldBase;
  const changedQuota = newQuota !== oldQuota;

  if (!changedBase && !changedQuota) {
    return true;
  }

  const feedbackEntry = {
    timestamp: new Date(),
    baseQuota: baseQuota,
    quota: newQuota,
    difference: (newQuota - oldQuota),
  };

  // set fields to update
  if (changedBase) ops.$set.baseQuota = baseQuota;
  if (changedQuota) ops.$set.quota = newQuota;

  // push single feedback entry at the beginning, limit to MAX_HISTORY_ITEMS
  ops.$push.quotaHistory = { $each: [feedbackEntry], $position: 0, $slice: MAX_HISTORY_ITEMS };

  try {
    await User.findByIdAndUpdate(userId, ops);
    revalidatePath('/box');
    console.log('updateQuotas success', { userId, ops });
    return true;
  } catch (err) {
    console.error('Errore updateQuotas:', err);
    return false;
  }
}