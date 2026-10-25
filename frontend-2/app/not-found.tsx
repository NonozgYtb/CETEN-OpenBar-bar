// app/not-found.tsx
import { redirect, RedirectType } from "next/navigation"

export default function NotFound() {
  redirect("/", RedirectType.replace)
}
