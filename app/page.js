'use client'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm an AI. How can I help you today? :)",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

    const userMessage = message
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: userMessage }]),
      })
    
      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(`Network response was not ok: ${errorMessage}`)
      }
    
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
    
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantMessage += decoder.decode(value, { stream: true })
        setMessages((messages) => {
          return [
            ...messages.slice(0, messages.length - 1),
            { role: 'assistant', content: assistantMessage },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  } 

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#000000" // Set the background to black
    >
      <Stack
        direction={'column'}
        width="1300px"
        height="900px"
        border="1px solid black"
        p={2}
        spacing={3}
        sx={{
          backgroundColor: '#1a1a1a', // Dark background for the chat container
          borderRadius: '16px',
        }}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                sx={{
                  bgcolor: message.role === 'assistant' ? 'transparent' : '#578df2', // Red for user
                  background: message.role === 'assistant'
                    ? 'linear-gradient(90deg, #00aaff, #00ffcc, #ff88ff)' // Multicolor gradient for assistant
                    : undefined,
                  color: 'black',
                  borderRadius: '20px',
                  p: 4,
                  maxWidth: '75%',
                  boxShadow: 3, // Add some shadow for a pop effect
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Type a message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              input: {
                color: 'white', // White text for input
              },
              label: {
                color: '#777777', // Grey label color
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#555555', // Grey border for input
                },
                '&:hover fieldset': {
                  borderColor: 'linear-gradient(90deg, #00aaff, #00ffcc, #ff88ff)', // Lighter grey on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'linear-gradient(90deg, #00aaff, #00ffcc, #ff88ff)', // Green border when focused
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              bgcolor: 'linear-gradient(90deg, #00aaff, #00ffcc, #ff88ff)', // Green button
              '&:hover': {
                bgcolor: '#ff88ff', // Darker green on hover
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
