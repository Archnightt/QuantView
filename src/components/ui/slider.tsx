"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// A simple native range slider styled to look like Shadcn/UI
const Slider = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
    value: number[],
    onValueChange: (val: number[]) => void,
    max?: number,
    step?: number
  }
>(({ className, value, onValueChange, max = 100, step = 1, ...props }, ref) => {
  
  const val = value[0] || 0;
  
  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
       <input
         type="range"
         ref={ref}
         min={0}
         max={max}
         step={step}
         value={val}
         onChange={(e) => onValueChange([parseFloat(e.target.value)])}
         className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary disabled:opacity-50"
         style={{
           background: `linear-gradient(to right, hsl(var(--primary)) ${(val / max) * 100}%, hsl(var(--secondary)) ${(val / max) * 100}%)`
         }}
         {...props}
       />
       <style jsx>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 1.25rem; /* h-5 */
          width: 1.25rem; /* w-5 */
          border-radius: 9999px;
          border: 2px solid hsl(var(--primary));
          background: hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--background)); 
          transition: colors 0.2s;
        }
        input[type=range]::-moz-range-thumb {
          height: 1.25rem;
          width: 1.25rem;
          border-radius: 9999px;
          border: 2px solid hsl(var(--primary));
          background: hsl(var(--background));
        }
      `}</style>
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
