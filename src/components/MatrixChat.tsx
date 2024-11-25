import React, { useState, useEffect, useRef } from 'react';
import { createClient, MatrixClient } from 'matrix-js-sdk';
import { Send, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MATRIX_CONFIG } from '../config/api';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
}

export default function MatrixChat() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<MatrixClient | null>(null);

  const handleNavigation = (content: string) => {
    // Convert content to lowercase for case-insensitive matching
    const lowerContent = content.toLowerCase();
    
    // Navigation patterns
    const patterns = {
      residents: {
        pattern: /(?:go to|show|view|open)\s+resident\s+(@[\w.-]+:[\w.-]+)/i,
        route: (id: string) => `/residents/${encodeURIComponent(id)}`
      },
      groups: {
        pattern: /(?:go to|show|view|open)\s+group\s+(![\w.-]+:[\w.-]+)/i,
        route: (id: string) => `/groups/${encodeURIComponent(id)}`
      },
      models: {
        pattern: /(?:go to|show|view|open)\s+model\s+([\w-]+)/i,
        route: (id: string) => `/models/${encodeURIComponent(id)}`
      },
      sections: {
        pattern: /(?:go to|show|view|open)\s+(residents|groups|models|settings|learn)/i,
        route: (section: string) => `/${section.toLowerCase()}`
      }
    };

    // Check for specific item navigation
    for (const [key, { pattern, route }] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        if (key === 'sections') {
          navigate(route(match[1]));
        } else {
          navigate(route(match[1]));
        }
        return true;
      }
    }

    // Check for general navigation commands
    if (lowerContent.includes('go home') || lowerContent.includes('go to home')) {
      navigate('/');
      return true;
    }

    // Handle list viewing commands
    if (lowerContent.includes('show all residents') || lowerContent.includes('list residents')) {
      navigate('/residents');
      return true;
    }
    if (lowerContent.includes('show all groups') || lowerContent.includes('list groups')) {
      navigate('/groups');
      return true;
    }
    if (lowerContent.includes('show all models') || lowerContent.includes('list models')) {
      navigate('/models');
      return true;
    }

    return false;
  };

  useEffect(() => {
    const initMatrix = async () => {
      try {
        clientRef.current = createClient({
          baseUrl: MATRIX_CONFIG.homeserverUrl,
          userId: MATRIX_CONFIG.defaultUserId,
          accessToken: MATRIX_CONFIG.defaultAccessToken,
        });

        clientRef.current.on("Room.timeline", (event: any) => {
          if (event.getType() === "m.room.message") {
            const content = event.getContent();
            
            // Add message to chat
            setMessages(prev => [...prev, {
              id: event.getId(),
              content: content.body,
              sender: event.getSender(),
              timestamp: event.getTs()
            }]);

            // Try to navigate based on message content
            handleNavigation(content.body);
          }
        });

        // For demo purposes, we'll just set connected state
        // In a real app, you'd want to properly handle the sync state
        setIsConnected(true);
        setError(null);

      } catch (err) {
        setError(language === 'en' 
          ? 'Failed to connect to chat server' 
          : '无法连接到聊天服务器');
        setIsConnected(false);
      }
    };

    if (isExpanded && !clientRef.current) {
      initMatrix();
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.stopClient();
        clientRef.current = null;
      }
    };
  }, [isExpanded, language, navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !clientRef.current || !isConnected) return;

    try {
      await clientRef.current.sendTextMessage(MATRIX_CONFIG.defaultRoomId, newMessage.trim());
      setNewMessage('');
      setError(null);
    } catch (err) {
      setError(language === 'en' 
        ? 'Failed to send message' 
        : '发送消息失败');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm transition-all duration-300 ${
      isExpanded ? 'h-96' : 'h-12'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">
            {language === 'en' ? 'Chat' : '聊天'}
          </span>
        </span>
        <span className="text-xs text-gray-500">
          {isExpanded ? (language === 'en' ? 'Close' : '关闭') : (language === 'en' ? 'Open' : '打开')}
        </span>
      </button>

      {isExpanded && (
        <div className="h-[calc(100%-3rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {error && (
              <div className="p-2 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                {language === 'en' 
                  ? 'No messages yet' 
                  : '暂无消息'}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded-lg max-w-[80%] ${
                  message.sender === clientRef.current?.getUserId()
                    ? 'ml-auto bg-indigo-100'
                    : 'bg-gray-100'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'en' ? 'Type a message...' : '输入消息...'}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!isConnected}
              />
              <button
                onClick={handleSend}
                disabled={!isConnected || !newMessage.trim()}
                className={`p-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isConnected && newMessage.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}