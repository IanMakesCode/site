"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Brain, Sparkles, Zap, Upload, X, FileText, ImageIcon, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import ChatMessage from "@/components/chat-message";
import LoadingScreen from "@/components/loading-screen";
import ModelSelector from "@/components/model-selector";
import FileUploadButton from "@/components/file-upload-button";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [files, setFiles] = useState<File[]>([]);
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [fileProcessing, setFileProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: "/api/chat",
    body: { model: selectedModel },
    onError: (err) => {
      console.error("Chat error:", err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;

    if (Object.keys(fileContents).length > 0) {
      let fileInfo = "I've uploaded the following files:\n\n";
      for (const [fileName, content] of Object.entries(fileContents)) {
        const contentPreview =
          typeof content === "string" && content.length > 500
            ? content.substring(0, 500) + "... (content truncated)"
            : content;
        fileInfo += `File: ${fileName}\nContent: ${contentPreview}\n\n`;
      }

      const userMessage = `${input}\n\n${fileInfo}`;
      append({
        role: "user",
        content: userMessage,
      });
    } else {
      handleSubmit(e);
    }

    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current!.style.height = "auto";
      }, 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && input.trim() !== "") {
        form.requestSubmit();
      }
    }
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    try {
      setFileProcessing(true);
      setFiles([...files, ...uploadedFiles]);

      const newFileContents: { [key: string]: string } = { ...fileContents };

      for (const file of uploadedFiles) {
        try {
          const content = await readFileContent(file);
          newFileContents[file.name] = content;
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          toast({
            title: "File Error",
            description: `Could not read file: ${file.name}`,
            variant: "destructive",
          });
        }
      }

      setFileContents(newFileContents);

      if (uploadedFiles.length > 0) {
        const fileNames = uploadedFiles.map((f) => f.name).join(", ");
        append({
          role: "system",
          content: `${uploadedFiles.length} file(s) uploaded: ${fileNames}. You can now ask questions about the content.`,
        });
      }
    } catch (err) {
      console.error("File upload error:", err);
      toast({
        title: "Upload Error",
        description: "Failed to process files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFileProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (file.type.includes("image")) {
            resolve(`[This is an image: ${file.name}]`);
          } else {
            resolve(event.target.result.toString());
          }
        } else {
          reject(new Error("Failed to read file content"));
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));

      if (file.type.includes("image")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    setFiles(updatedFiles);

    const updatedFileContents = { ...fileContents };
    delete updatedFileContents[fileToRemove.name];
    setFileContents(updatedFileContents);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes("image")) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <FileCode className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/60 border-b border-border/20">
          <div className="container flex items-center justify-between h-16 px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-semibold">NovaGPT</h1>
            </motion.div>

            <div className="flex items-center gap-2">
              <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatMessage message={m} />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Bar */}
        <footer className="sticky bottom-0 w-full bg-background/60 backdrop-blur-md border-t border-border/20">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={onSubmit} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FileUploadButton onUpload={handleFileUpload} disabled={fileProcessing} />
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 resize-none"
                  rows={1}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  {isLoading ? <Zap className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs"
                    >
                      {getFileIcon(file)}
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile(file)}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </footer>
      </div>

      <Toaster />
    </ThemeProvider>
  );
}
