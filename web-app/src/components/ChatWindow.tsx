/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatWindow = ({ userType = 'user' }) => {
  const [messages, setMessages] = useState<any>(localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages') ?? "") : []);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [streaming, setStreaming] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef(null);
  const [currentStream, setCurrentStream] = useState<{ streamId: string, chunks: string[] } | null>(null);

  const handleClearMsgs = () => {
    setMessages([]);
    localStorage.removeItem('messages');
  }

  useEffect(() => {
    // Connect to Socket.io server
    socketRef.current = io('http://localhost:3002');

    // Set up event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    // Message handlers
    if (userType === 'user') {
      console.log("if else if")
      // User receives agent messages
      socketRef.current.on('agent-message', (data: string) => {
        setMessages((prev: any) => [...prev, { text: data, sender: 'agent' }]);
      });

      // User receives agent stream start
      socketRef.current.on('stream-start', ({ streamId }: { streamId: string }) => {
        setMessages((prev: any) => [...prev, {
          text: '',
          sender: 'agent',
          streamId,
          isStreaming: true
        }]);
        setCurrentStream({ streamId, chunks: [] });
      });

      // User receives agent chunks
      socketRef.current.on('stream-chunk', ({ chunk, streamId, isLast }: { chunk: string, streamId: string, isLast: boolean }) => {
        console.log('stream message', chunk);

        setMessages((prev: any) => prev.map((msg: any) => {
          if (msg.streamId === streamId) {
            const newText = msg.text + chunk;
            return { ...msg, text: newText, isStreaming: !isLast };
          }
          return msg;
        }));

        if (isLast) {
          setCurrentStream(null);
          setStreaming(false);
        }
      });
    } else {
      console.log("if else else")
      // Agent receives user messages
      socketRef.current.on('user-message', (data: string) => {
        console.log(data, "tttttt")
        setMessages((prev: any) => [...prev, { text: data, sender: 'user' }]);
      });
    }

    // Listen for typing indicators
    socketRef.current.on('typing', (from: any) => {
      if (from !== userType) {
        setIsTyping(true);
        setTypingUser(from);
        const timer = setTimeout(() => {
          setIsTyping(false);
          setTypingUser('');
        }, 2000);
        return () => clearTimeout(timer);
      }
    });

    // Listen for streaming indicators
    socketRef.current.on('stream-start', () => {
      setStreaming(true);
    });

    // Clean up on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [userType]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Save to Local storage
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages, currentStream]);

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (message.trim() === '') return;

    // Emit the message
    const messageEvent = userType === 'user' ? 'user-message' : 'agent-message';
    socketRef.current.emit(messageEvent, message);

    // Optimistically add to local messages immediately
    setMessages((prev: any) => [...prev, { text: message, sender: userType }]);
    setMessage('');
  };

  const handleTyping = () => {
    // Notify others when typing
    socketRef.current.emit('typing', userType);
  };

  // Agent can send streaming response
  const handleSendStreamingResponse = async () => {
    if (message.trim() === '') return;

    const streamId = `stream-${Date.now()}`;
    socketRef.current.emit('start-stream', { streamId });

    // Simulate streaming by breaking message into chunks
    const chunkSize = 10;
    const chunks: string[] = [];
    for (let i = 0; i < message.length; i += chunkSize) {
      chunks.push(message.substring(i, i + chunkSize));
    }
    setMessage('');

    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const isLast = i === chunks.length - 1;
      socketRef.current.emit('stream-chunk', {
        chunk: chunks[i],
        streamId,
        isLast
      });
    }

    // Update local state for agent preview
    setMessages((prev: any) => [...prev, { text: message, sender: userType }]);
  };
console.log(messages)
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{userType === 'user' ? 'Customer Support' : 'Agent'} Chat</h2>
      </div>

      <div className="messages-container">
        {messages.map((msg: any, index: number) => (
          <div
            key={index}
            className={`message ${msg.sender === userType ? 'sent' : 'received'} ${msg.isStreaming ? 'streaming' : ''
              }`}
          >
            <b>{msg.sender}</b>: {msg.text}
            {msg.isStreaming && <span className="streaming-indicator">...</span>}
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            {typingUser === 'user' ? 'User' : 'Agent'} is typing...
          </div>
        )}
        {streaming && <div className="typing-indicator">Streaming...</div>}
        <div ref={messagesEndRef} />
      </div>
      <button onClick={handleClearMsgs} >Clear All</button>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
        {userType === 'agent' && (
          <button
            type="button"
            onClick={handleSendStreamingResponse}
            className="stream-button"
          >
            Send as Stream
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatWindow;