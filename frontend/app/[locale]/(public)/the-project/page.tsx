import { redirect } from "next/navigation";

/** Legacy PROSPER clone route — use `/about`. */
export default function TheProjectRedirect() {
  redirect("/about");
}
