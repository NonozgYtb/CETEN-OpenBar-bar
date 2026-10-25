import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn, minmax } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"

export const inputVariants = cva(
  "w-full min-w-0 rounded-3xl border border-transparent bg-input/50 transition-[color,box-shadow,background-color] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-9 px-3 py-1 text-base file:h-7",
        small: "h-7 px-2 py-1 text-sm file:h-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type InputVariants = VariantProps<typeof inputVariants>

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, keyof InputVariants> & InputVariants) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export function InputFixed({
  value,
  setValue,
  precision = 2,
  min,
  max,
  onBlur,
  onChange,
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof Input>,
  "step" | "type" | "min" | "max" | "value"
> & {
  precision?: number
  setValue?: (value: number) => void
  value?: number
  max?: number
  min?: number
}) {
  const [rawValue, setRawValue] = React.useState<string>(
    value?.toFixed(precision) ?? (0).toFixed(precision)
  )
  return (
    <Input
      {...props}
      min={min}
      max={max}
      type="number"
      step={Math.pow(10, -precision)}
      value={rawValue}
      onChange={(e) => {
        setRawValue(
          e.target.value
            .replaceAll(",", ".")
            .replaceAll("e", ".")
            .replace(/[^0-9.-]/g, "")
        )
        onChange?.(e)
      }}
      onBlur={(e) => {
        const v = parseFloat(e.target.value)
        if (isNaN(v)) {
          setRawValue(value?.toFixed(precision) ?? (0).toFixed(precision))
          return onBlur?.(e)
        }
        const num = minmax(
          +Number(
            e.target.value
              .replaceAll(",", ".")
              .replaceAll("e", ".")
              .replace(/[^0-9.-]/g, "") || 0
          ).toFixed(precision)
        )
        setValue?.(num)
        setRawValue(num?.toFixed(precision) ?? (0).toFixed(precision))
        onBlur?.(e)
      }}
      className={cn(className, "hide-buttons")}
    />
  )
}

export { Input }
