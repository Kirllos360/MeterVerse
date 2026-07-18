import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--text)] text-[var(--text-inverse)] hover:bg-[var(--text)]/85 active:bg-[var(--text)]/70 shadow-sm",
        secondary: "bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]",
        ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]",
        danger: "bg-[var(--red)] text-white hover:bg-[var(--red)]/85 active:bg-[var(--red)]/70",
        brand: "bg-[var(--brand)] text-[var(--text-inverse)] hover:bg-[var(--brand-hover)]",
      },
      size: {
        sm: "h-7 px-2.5 text-[var(--font-caption)] rounded-[var(--radius-6)]",
        md: "h-9 px-3.5 text-[var(--font-caption)] rounded-[var(--radius-8)]",
        lg: "h-11 px-5 text-[var(--font-small)] rounded-[var(--radius-10)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius-8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]",
        solid: "bg-[var(--bg-raised)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-hover)]",
        primary: "bg-[var(--text)] text-[var(--text-inverse)] hover:opacity-85",
      },
      size: {
        sm: "h-7 w-7 [&_svg]:h-[14px] [&_svg]:w-[14px]",
        md: "h-9 w-9 [&_svg]:h-[16px] [&_svg]:w-[16px]",
        lg: "h-11 w-11 [&_svg]:h-[20px] [&_svg]:w-[20px]",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  }
);

export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--bg-active)] text-[var(--text-secondary)]",
        success: "bg-[var(--green-soft)] text-[var(--green)]",
        warning: "bg-[var(--amber-soft)] text-[var(--amber)]",
        danger: "bg-[var(--red-soft)] text-[var(--red)]",
        info: "bg-[var(--blue-soft)] text-[var(--blue)]",
        brand: "bg-[var(--brand-soft)] text-[var(--text)]",
      },
      size: {
        sm: "h-[18px] px-1.5 text-[var(--font-label)]",
        md: "h-5 px-2 text-[var(--font-caption)]",
        lg: "h-6 px-2.5 text-[var(--font-small)]",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);
