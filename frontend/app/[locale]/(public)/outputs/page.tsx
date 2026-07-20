import { redirect } from "next/navigation";

/** Legacy PROSPER clone route — use `/documents`. */
export default function OutputsRedirect() {
  redirect("/documents");
}
