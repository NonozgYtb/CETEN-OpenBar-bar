import { cn } from "@/lib/utils"

const typoConfig = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7 [&:not(:first-child)]:mt-6",
  blockquote: "mt-6 border-l-2 pl-6 italic",
  list: "my-6 ml-6 list-disc [&>li]:mt-2",
  muted: "text-sm text-muted-foreground",
}

export const TypoH1 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn(typoConfig.h1, className)} {...props} />
)

export const TypoH2 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn(typoConfig.h2, className)} {...props} />
)

export const TypoH3 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn(typoConfig.h3, className)} {...props} />
)

export const TypoH4 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4 className={cn(typoConfig.h4, className)} {...props} />
)

export const TypoP = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn(typoConfig.p, className)} {...props} />
)

export const TypoBlockquote = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLQuoteElement>) => (
  <blockquote className={cn(typoConfig.blockquote, className)} {...props} />
)

export const TypoList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn(typoConfig.list, className)} {...props} />
)

export const TypoMuted = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn(typoConfig.muted, className)} {...props} />
)