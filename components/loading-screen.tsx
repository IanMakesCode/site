"use client"

import { motion } from "framer-motion"
import { Brain } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-purple-500/40 blur-xl"></div>
          <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30">
            <Brain className="h-12 w-12 text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
        >
          NeuroGPT
        </motion.h1>

        <div className="relative w-48 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-sm"
        >
          Initializing neural networks...
        </motion.p>
      </div>
    </div>
  )
}
