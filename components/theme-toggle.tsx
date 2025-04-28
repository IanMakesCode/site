"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative h-9 w-9 rounded-full"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 45 : 0, opacity: theme === "dark" ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-4 w-4" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ rotate: theme === "light" ? -45 : 0, opacity: theme === "light" ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-4 w-4" />
      </motion.div>

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
