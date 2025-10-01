import { ComponentPropsWithoutRef, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className: string
  background: ReactNode
  Icon: React.ElementType
  description: string
  onClick?: () => void
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  onClick,
  ...props
}: BentoCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      key={name}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl cursor-pointer",
        // light styles
        "bg-white border border-gray-200 shadow-sm",
        "hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300",
        // dark styles
        "dark:bg-gray-900 dark:border-gray-800 dark:hover:border-blue-600 dark:hover:shadow-blue-500/20",
        "transition-all duration-500 ease-out hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <div>{background}</div>
      <div className="p-6 relative z-10">
        <div className="flex transform-gpu flex-col gap-2 transition-all duration-500 ease-out">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white transition-all duration-500 ease-out group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-blue-500/50">
            <Icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2 transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1">
            {name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">{description}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-500 ease-out group-hover:bg-gradient-to-br group-hover:from-blue-50/80 group-hover:via-indigo-50/50 group-hover:to-transparent dark:group-hover:from-blue-900/30 dark:group-hover:via-indigo-900/20 dark:group-hover:to-transparent" />
    </div>
  );
}

export { BentoCard, BentoGrid }
