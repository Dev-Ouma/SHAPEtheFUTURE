import { redirect } from "next/navigation";

/** Legacy PROSPER clone route — use `/gallery`. */
export default function MediaRedirect() {
  redirect("/gallery");
}
