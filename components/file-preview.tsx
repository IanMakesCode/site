"use client"

import { useState } from "react"
import { X, Maximize2, Minimize2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FilePreviewProps {
  file: File
  content: string
  onClose: () => void
}

export default function FilePreview({ file, content, onClose }: FilePreviewProps) {
  const [expanded, setExpanded] = useState(false)

  const isImage = file.type.includes("image")
  const isPDF = file.type.includes("pdf")

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  const downloadFile = () => {
    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "fixed z-50 bg-background/95 backdrop-blur-md border border-border/30 rounded-lg shadow-lg overflow-hidden",
          expanded ? "inset-4" : "left-4 right-4 bottom-4 top-auto max-h-[70vh]",
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <h3 className="font-medium truncate">{file.name}</h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadFile}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleExpand}>
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="sr-only">{expanded ? "Minimize" : "Maximize"}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        <div className="p-4 overflow-auto" style={{ maxHeight: expanded ? "calc(100vh - 8rem)" : "60vh" }}>
          {isImage ? (
            <img src={content || "/placeholder.svg"} alt={file.name} className="max-w-full h-auto mx-auto rounded-md" />
          ) : isPDF ? (
            <div className="flex items-center justify-center h-full">
              <iframe src={content} title={file.name} className="w-full h-full min-h-[500px]" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-sm bg-card/50 p-4 rounded-md">
              {content.length > 100000
                ? content.substring(0, 100000) + "... (file truncated, too large to display fully)"
                : content}
            </pre>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
