import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        destructive: "border-transparent bg-destructive text-white",
        mandatory: "border-rose-red/30 bg-rose-red/10 text-rose-red",
        "partly-mandatory": "border-orange/30 bg-orange/10 text-orange",
        optional: "border-border bg-muted text-muted-foreground",
        certified: "border-transparent bg-igbc-certified/15 text-igbc-certified",
        silver: "border-transparent bg-igbc-silver/15 text-igbc-silver",
        gold: "border-transparent bg-igbc-gold/15 text-igbc-gold",
        platinum: "border-transparent bg-igbc-blue/15 text-igbc-blue",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
