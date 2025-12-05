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
  });

  revalidatePath("/box");
}

export async function updateQuota(userId: string, newQuota: number) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return;

  await connectDB();

  if (newQuota < 0) return;

  await User.findByIdAndUpdate(userId, { quota: newQuota });
  revalidatePath("/box");
}

export async function deleteUser(formData: FormData) {
  const isAdmin = await checkAuth();
  if (!isAdmin) return;

  await connectDB();
  const id = formData.get("id");
  await User.findByIdAndDelete(id);
  revalidatePath("/box");
}