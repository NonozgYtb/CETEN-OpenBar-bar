export { cn } from "cn"

export const formatCustomFrenchDate = (date: Date | number) => {
  if (typeof date === "number") date = new Date(date * 1000)

  const datePart = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
  }).format(date)
  const timePart = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" })
    .format(date)
    .replace(":", "h")

  return `${datePart} à ${timePart}`
}

export const formatPrice = (price: number, forceSign?: "+" | "-") =>
  `${forceSign || ""}${forceSign ? Math.abs(price / 100).toFixed(2) : (price / 100).toFixed(2)} €`

export const formatDate = (date: Date | number) => {
  if (typeof date === "number") date = new Date(date * 1000)
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}