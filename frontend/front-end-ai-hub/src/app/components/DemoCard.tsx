"use client";
import { useState } from "react";
import { MessageSquare, Brain, Send } from "lucide-react";

export default function DemoCard() {
  const [messages, setMessages] = useState([
    { type: "user", content: "What are the key features of our product?", timestamp: "2:30 PM" },
    { type: "ai", content: "Based on your documents, I found information about AI-powered search, document processing, and team collaboration features.", timestamp: "2:31 PM" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        type: "user" as const,
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          type: "ai" as const,
          content: "I'm analyzing your documents to provide the most relevant answer...",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-500">AI Knowledge Hub</span>
      </div>
      
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-3 rounded-lg ${
              message.type === "user" ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            {message.type === "user" ? (
              <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
            ) : (
              <Brain className="w-5 h-5 text-blue-600 mt-1" />
            )}
            <div className="flex-1">
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your documents..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 