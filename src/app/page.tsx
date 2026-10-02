import { redirect } from "next/navigation";

// La página principal envía directamente al inicio de sesión
export default function Home() {
  redirect("/login");
}
