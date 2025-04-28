"use client"

import type { Message } from "ai"
import { motion } from "framer-motion"
import { Brain, User, Check, Copy } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // For system messages (like file uploads)
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center my-2"
      >
        <div className="px-3 py-1.5 text-xs bg-muted/50 text-muted-foreground rounded-full border border-border/30 flex items-center gap-1.5">
          <Brain className="h-3 w-3" />
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex gap-3 p-4 rounded-xl mx-auto w-full max-w-3xl",
        isUser ? "bg-primary/10 border border-primary/20" : "bg-card/40 backdrop-blur-sm border border-border/30",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
          isUser
            ? "bg-gradient-to-br from-primary/30 to-purple-500/30 text-primary"
            : "bg-gradient-to-br from-muted/80 to-muted text-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm">
            {isUser ? (
              "You"
            ) : (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                NeuroGPT
              </span>
            )}
          </div>

          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span className="sr-only">Copy message</span>
            </Button>
          )}
        </div>
        <div className="prose prose-neutral dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                  >
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="mt-2 mb-2 overflow-x-auto rounded-lg bg-card p-2 text-sm">{children}</pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  )
}
