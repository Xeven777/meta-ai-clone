'use client'

import { useChat, Message } from 'ai/react'
import { Mic, Send, Loader2, Play, Pause, X, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const suggestions = [
  { emoji: '👴', text: 'Retirement savings guide' },
  { emoji: '💡', text: '5 energy-saving tips' },
  { emoji: '📱', text: 'Tech gadget wishlist' },
  { emoji: '🕺', text: 'Let\'s play 90s trivia' },
  { emoji: '💃', text: 'Online dance classes' },
  { emoji: '🍳', text: 'Quick and easy recipes' },
  { emoji: '🌿', text: 'Sustainable living tips' },
  { emoji: '📚', text: 'Book recommendations' },
  { emoji: '🧘', text: 'Beginner\'s guide to meditation' },
  { emoji: '🎨', text: 'DIY home decor ideas' },
  { emoji: '🐕', text: 'Dog training techniques' },
  { emoji: '💼', text: 'Career development advice' },
  { emoji: '🌎', text: 'Eco-friendly travel tips' },
  { emoji: '🧠', text: 'Memory improvement exercises' },
  { emoji: '🎸', text: 'Learn a musical instrument' }
]

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat()
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (recording) {
      startRecording()
    } else {
      stopRecording()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [recording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable)
      mediaRecorderRef.current.start()
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= 30) {
            stopRecording()
            return 30
          }
          return prevTime + 1
        })
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      setAudioBlob(event.data)
    }
  }

  const handleVoiceSubmit = async () => {
    if (!audioBlob) return

    // Dummy API call for voice processing
    const dummyTranscription = "This is a dummy transcription of the voice message."
    
    // Append user's voice message
    const userMessage: Message = { role: 'user', content: '[Voice Message]' }
    append(userMessage)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Append AI's response to transcription
    const aiMessage: Message = { role: 'assistant', content: `I received a voice message. Here's what I understood: "${dummyTranscription}"` }
    append(aiMessage)

    // Reset audio blob and recording time
    setAudioBlob(null)
    setRecordingTime(0)
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const cancelRecording = () => {
    stopRecording()
    setAudioBlob(null)
    setRecordingTime(0)
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3 p-4 border-b border-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
          <div>
            <h1 className="font-semibold">AI Assistant</h1>
            <p className="text-sm text-gray-400">with GPT-4</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {/* Add new chat logic here */}}>
          <PlusCircle className="h-5 w-5" />
        </Button>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/pattern.png')] bg-repeat">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center justify-center h-40 gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 animate-pulse" />
                <h2 className="text-2xl font-bold">Ask AI Assistant anything</h2>
              </div>
              
              <div className="relative overflow-hidden w-full h-16 mt-4">
                <div className="absolute whitespace-nowrap animate-marquee">
                  {[...suggestions, ...suggestions].map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 mx-2"
                      onClick={() => handleInputChange({ target: { value: suggestion.text } } as any)}
                    >
                      {suggestion.emoji} {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "flex gap-3 max-w-xl",
              message.role === "user" ? "ml-auto" : ""
            )}
          >
            {message.role !== "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex-shrink-0" />
            )}
            <div className={cn(
              "rounded-2xl p-4",
              message.role === "user" 
                ? "bg-green-600" 
                : "bg-gray-800"
            )}>
              <p>{message.content}</p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is thinking...</span>
          </motion.div>
        )}
      </div>

      {/* Recording animation */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span>Recording... {recordingTime}s</span>
            </div>
            <Button onClick={cancelRecording} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice message preview */}
      <AnimatePresence>
        {audioBlob && !recording && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <Button onClick={togglePlayPause} size="sm" variant="ghost">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <span>Voice message ({recordingTime}s)</span>
              <audio ref={audioRef} src={URL.createObjectURL(audioBlob)} onEnded={() => setIsPlaying(false)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVoiceSubmit} size="sm">Send</Button>
              <Button onClick={cancelRecording} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 border-t border-gray-800"
      >
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Message"
            className="w-full rounded-full bg-gray-900 border border-gray-700 px-4 py-2 pr-20 focus:outline-none focus:border-blue-400"
          />
          <div className="absolute right-2 flex gap-2">
            <Button 
              type="button" 
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setRecording(!recording)}
              disabled={audioBlob !== null}
            >
              <Mic className={cn("h-4 w-4", recording && "text-red-500 animate-pulse")} />
            </Button>
            <Button 
              type="submit" 
              size="icon" 
              className="h-8 w-8"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.form>
    </div>
  )
}

