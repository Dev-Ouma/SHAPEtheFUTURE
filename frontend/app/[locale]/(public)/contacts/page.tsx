import { redirect } from "next/navigation";

/** Legacy PROSPER clone route — use `/contact`. */
export default function ContactsRedirect() {
  redirect("/contact");
}
