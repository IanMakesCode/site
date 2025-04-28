"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Brain, Sparkles, Zap, Upload, X, FileText, ImageIcon, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import ChatMessage from "@/components/chat-message"
import LoadingScreen from "@/components/loading-screen"
import ModelSelector from "@/components/model-selector"
import FileUploadButton from "@/components/file-upload-button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo") // Default to a reliable model
  const [files, setFiles] = useState<File[]>([])
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({})
  const [fileProcessing, setFileProcessing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize chat with model selection
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
    onError: (err) => {
      console.error("Chat error:", err)
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === "") return

    // If there are files, include their content in the message
    if (Object.keys(fileContents).length > 0) {
      let fileInfo = "I've uploaded the following files:\n\n"

      for (const [fileName, content] of Object.entries(fileContents)) {
        // For large files, only include a summary
        const contentPreview =
          typeof content === "string" && content.length > 500
            ? content.substring(0, 500) + "... (content truncated)"
            : content

        fileInfo += `File: ${fileName}\nContent: ${contentPreview}\n\n`
      }

      // Append file info to the user's message
      const userMessage = `${input}\n\n${fileInfo}`

      // Custom submit with file info
      append({
        role: "user",
        content: userMessage,
      })
    } else {
      // Normal submit without files
      handleSubmit(e)
    }

    // Reset textarea height
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current!.style.height = "auto"
      }, 10)
    }
  }

  // Handle textarea key press (Enter to submit, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form && input.trim() !== "") {
        form.requestSubmit()
      }
    }
  }

  // Handle file upload with better error handling
  const handleFileUpload = async (uploadedFiles: File[]) => {
    try {
      setFileProcessing(true)
      setFiles([...files, ...uploadedFiles])

      const newFileContents: { [key: string]: string } = { ...fileContents }

      for (const file of uploadedFiles) {
        try {
          const content = await readFileContent(file)
          newFileContents[file.name] = content
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error)
          toast({
            title: "File Error",
            description: `Could not read file: ${file.name}`,
            variant: "destructive",
          })
        }
      }

      setFileContents(newFileContents)

      // Notify the user that files were uploaded
      if (uploadedFiles.length > 0) {
        const fileNames = uploadedFiles.map((f) => f.name).join(", ")
        append({
          role: "system",
          content: `${uploadedFiles.length} file(s) uploaded: ${fileNames}. You can now ask questions about the content.`,
        })
      }
    } catch (err) {
      console.error("File upload error:", err)
      toast({
        title: "Upload Error",
        description: "Failed to process files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFileProcessing(false)
    }
  }

  // Read file content with better error handling
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          // For images, just indicate it's an image
          if (file.type.includes("image")) {
            resolve(`[This is an image: ${file.name}]`)
          } else {
            resolve(event.target.result.toString())
          }
        } else {
          reject(new Error("Failed to read file content"))
        }
      }

      reader.onerror = () => {
        reject(new Error("File reading error"))
      }

      if (file.type.includes("image")) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  // Remove file
  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove)
    setFiles(updatedFiles)

    const updatedFileContents = { ...fileContents }
    delete updatedFileContents[fileToRemove.name]
    setFileContents(updatedFileContents)
  }

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.includes("image")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-4 w-4" />
    } else {
      return <FileCode className="h-4 w-4" />
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/60 border-b border-border/20">
          <div className="container flex items-center justify-between h-16 px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/60 to-purple-600/60 rounded-full blur-sm opacity-70"></div>
                <div className="relative bg-background rounded-full p-1">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                  Neuro<span className="text-foreground">GPT</span>
                </h1>
                <div className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-md">
                  {selectedModel}
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col items-center">
          <div className="flex flex-col w-full h-[calc(100vh-13rem)] md:h-[calc(100vh-10rem)]">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4 custom-scrollbar">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-6"
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-70"></div>
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30">
                      <Brain className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                      Welcome to NeuroGPT
                    </h2>
                    <p className="text-muted-foreground">
                      Ready to use with a pre-configured API key. Start chatting or upload files for analysis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                    {[
                      { icon: <Sparkles className="w-4 h-4" />, text: "Explain quantum computing" },
                      { icon: <Zap className="w-4 h-4" />, text: "Write a short story about AI" },
                      { icon: <FileText className="w-4 h-4" />, text: "Summarize the uploaded document" },
                      { icon: <Upload className="w-4 h-4" />, text: "Analyze the data in my file" },
                    ].map((suggestion, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start gap-2 h-auto py-3 px-4 bg-card/50 hover:bg-card/80 transition-all border-border/50"
                        onClick={() => handleInputChange({ target: { value: suggestion.text } } as any)}
                      >
                        {suggestion.icon}
                        <span className="truncate">{suggestion.text}</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* File previews */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto p-2 bg-card/30 rounded-lg border border-border/30"
              >
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 bg-card/50 px-2 py-1 rounded-md border border-border/30 text-sm"
                  >
                    {getFileIcon(file)}
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeFile(file)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="sticky bottom-0 pt-4 w-full">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
                >
                  <p>Error: {error.message || "Something went wrong. Please try again."}</p>
                </motion.div>
              )}

              <form onSubmit={onSubmit} className="relative">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message NeuroGPT..."
                    className="pr-24 min-h-[60px] max-h-[200px] resize-none rounded-xl border-border/30 bg-card/30 backdrop-blur-lg focus:border-primary/50 focus:ring-primary/50 transition-all"
                    disabled={isLoading || fileProcessing}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    <FileUploadButton onFileUpload={handleFileUpload} disabled={isLoading || fileProcessing} />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8 bg-primary hover:bg-primary/90 transition-all"
                      disabled={isLoading || fileProcessing || input.trim() === ""}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </div>
                </div>

                {(isLoading || fileProcessing) && (
                  <div className="absolute -top-6 left-0 right-0 flex justify-center">
                    <div className="px-3 py-1 text-xs font-medium text-primary/80 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                      {fileProcessing ? "Processing files..." : "NeuroGPT is thinking..."}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
