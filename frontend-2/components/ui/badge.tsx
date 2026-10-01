import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-3xl border border-transparent font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        warning:
          "bg-warning/20 text-warning focus-visible:ring-warning/20 focus-visible:ring-warning/40 [a]:hover:bg-warning/20",
        destructive:
          "bg-destructive/20 text-destructive focus-visible:ring-destructive/20 focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted/50 hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-5 px-2 py-0.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        big: "h-6 px-3 py-1 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

export type BadgeProps = useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>

export const Badge = ({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: BadgeProps) =>
  useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  })
