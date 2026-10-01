"use client"

import { cn } from "cn"

import { AButton, Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  IconBrandGoogle,
  IconBrandGoogleFilled,
  IconX,
} from "@tabler/icons-react"
import { useState, useEffect } from "react"

export function AuthPage({ className, ...props }: React.ComponentProps<"div">) {
  const [domain, setDomain] = useState<URL | null>(null)
  useEffect(() => {
    const url = new URL("/me", window.location.href)
    setDomain(url)
  }, [])
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center gap-4 md:justify-start">
          <img
            src="/logo-small.webp"
            alt="OpenBar Logo"
            className="h-8 rounded-lg"
          />
          <IconX className="size-4 text-muted-foreground" />
          <span className="text-2xl font-bold">OpenBar</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6", className)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Se connecter à OpenBar</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Si vous n&apos;avez pas de compte, passez d'abord votre
                    carte à une borne au bar.
                  </p>
                </div>
                <Field>
                  <AButton
                    href={`${process.env.NEXT_PUBLIC_API}/auth/google?r=${encodeURIComponent(domain?.toString() || "")}`}
                    type="button"
                    className="gap-4!"
                  >
                    <IconBrandGoogleFilled />
                    Se connecter avec TN.net
                  </AButton>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/background.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.5]"
        />
      </div>
    </div>
  )
}
