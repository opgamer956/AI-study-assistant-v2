import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  StudyMode, 
  Message, 
  Role,
  Language,
  ChatSession
} from './types';
import { UI_TEXT, MODE_CONFIG, MODE_LABELS } from './constants';
import { 
  generateStudyContent, 
  generateSpeech, 
  transcribeAudio 
} from './services/geminiService';
import { 
  getHistory, 
  saveHistory, 
  getExtensions, 
  saveExtensions 
} from './services/storageService';
import { ChatMessage } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { Sidebar } from './components/Sidebar';
import { ImageModal } from './components/ImageModal';
import { ExtensionModal } from './components/ExtensionModal';
import { ProgressModal } from './components/ProgressModal';
import { playPcmAudio } from './services/audioUtils';
import { Logo } from './components/Logo';

function App() {
  const [language, setLanguage] = useState<Language>('bn');
  const [currentMode, setCurrentMode] = useState<StudyMode>(StudyMode.EXPLANATION);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Data State
  const [messages, setMessages] = useState<Message[]>([{
      id: 'welcome',
      role: Role.MODEL,
      text: MODE_CONFIG[StudyMode.EXPLANATION].welcome['bn'],
  }]);
  
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [extensions, setExtensions] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = UI_TEXT[language];

  // Derive current theme from mode
  const currentTheme = MODE_CONFIG[currentMode].color;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load History and Extensions on Mount
  useEffect(() => {
    const loadedHistory = getHistory();
    const loadedExtensions = getExtensions();
    setHistory(loadedHistory);
    setExtensions(loadedExtensions);
  }, []);

  // Auto-save History when messages change
  // Note: We need to be careful not to save welcome messages as "active" sessions unless user interacted
  useEffect(() => {
    if (!activeSessionId) return; 
    
    // Find the current session in history
    const existingSessionIndex = history.findIndex(s => s.id === activeSessionId);
    
    if (existingSessionIndex >= 0) {
        const updatedHistory = [...history];
        updatedHistory[existingSessionIndex] = {
            ...updatedHistory[existingSessionIndex],
            messages: messages,
            timestamp: Date.now(),
            mode: currentMode // Keep mode synced
        };
        setHistory(updatedHistory);
        saveHistory(updatedHistory);
    }
  }, [messages, activeSessionId, currentMode]); // Remove history dependency to avoid loops

  /**
   * Handle Mode Change with "Separate Chat Box" Logic
   * When switching modes, we look for the last active session for that mode.
   * If found, we resume it. If not, we start a fresh "chat box" for that mode.
   */
  const handleModeChange = (newMode: StudyMode) => {
    if (newMode === currentMode) return;

    // 1. Find the most recent session for the new mode
    // We reverse a copy of the array to find the latest
    const lastSessionForMode = [...history].reverse().find(s => s.mode === newMode);

    if (lastSessionForMode) {
        // Resume existing chat box
        setCurrentMode(newMode);
        setActiveSessionId(lastSessionForMode.id);
        setMessages(lastSessionForMode.messages);
    } else {
        // Create new chat box (UI state only, ID created on first message)
        setCurrentMode(newMode);
        setActiveSessionId(null);
        setMessages([{
            id: 'welcome',
            role: Role.MODEL,
            text: MODE_CONFIG[newMode].welcome[language]
        }]);
    }
  };

  // Handle Audio Input
  useEffect(() => {
    const handleAudioInput = async (e: Event) => {
      const customEvent = e as CustomEvent<{ base64: string; mimeType: string }>;
      const { base64, mimeType } = customEvent.detail;

      setIsLoading(true);
      try {
        const text = await transcribeAudio(base64, mimeType);
        if (text) {
          handleSendMessage(text);
        } else {
           alert("Could not understand audio");
           setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    window.addEventListener('audio-input', handleAudioInput);
    return () => window.removeEventListener('audio-input', handleAudioInput);
  }, [currentMode, language, activeSessionId, history, extensions]); 

  // --- ACTIONS ---

  const handleToggleExtension = (id: string) => {
    const updated = { ...extensions, [id]: !extensions[id] };
    setExtensions(updated);
    saveExtensions(updated);
  };

  /**
   * Shared function to process API Request and update UI
   */
  const processAIResponse = async (
    prompt: string, 
    image: string | undefined, 
    currentMessages: Message[]
  ) => {
    setIsLoading(true);
    try {
      const response = await generateStudyContent({
        prompt: prompt,
        image,
        mode: currentMode,
        language: language,
        extensions: extensions
      });

      const responseId = uuidv4();
      const newModelMsg: Message = {
        id: responseId,
        role: Role.MODEL,
        text: response.text,
        generatedImages: response.generatedImages, // Capture generated images if any
      };

      const finalMessages = [...currentMessages, newModelMsg];
      setMessages(finalMessages);
      setIsLoading(false);

      // Handle Auto Voice if enabled AND no images generated (usually we read text explanations)
      if (extensions['auto_voice'] && response.text && (!response.generatedImages || response.generatedImages.length === 0)) {
        try {
          setTimeout(async () => {
             const audioData = await generateSpeech(response.text);
             if (audioData) {
               playPcmAudio(audioData);
               setMessages((prev) => 
                 prev.map((msg) => 
                   msg.id === responseId 
                     ? { ...msg, audio: true, audioData } 
                     : msg
                 )
               );
             }
          }, 500);
        } catch (e) { console.error(e); }
      } 
      // Generate speech for manual playback availability (lazily or mostly text)
      else if (response.text && response.text.trim().length > 0) {
            generateSpeech(response.text).then(audioData => {
                if (audioData) {
                    setMessages((prev) => 
                        prev.map((msg) => 
                        msg.id === responseId 
                            ? { ...msg, audio: true, audioData } 
                            : msg
                        )
                    );
                }
            }).catch(e => console.error(e));
      }

    } catch (error) {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: Role.MODEL,
          text: t.error,
          isError: true,
        },
      ]);
    }
  };

  const handleSendMessage = async (text: string, image?: string) => {
    let currentSessionId = activeSessionId;
    
    // If this is the first message of a session (activeSessionId is null)
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      const title = text.length > 25 ? text.substring(0, 25) + '...' : text;
      const newSession: ChatSession = {
        id: currentSessionId,
        title,
        timestamp: Date.now(),
        messages: [],
        mode: currentMode
      };
      // We must add it to history immediately so the session persists
      setHistory(prev => [...prev, newSession]);
      setActiveSessionId(currentSessionId);
    }

    const newUserMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      text,
      image,
    };

    // If it was a welcome message state only, replace/append correctly
    const baseMessages = (messages.length === 1 && messages[0].id === 'welcome')
       ? [newUserMsg] // Remove welcome message to clean up chat
       : [...messages, newUserMsg];

    setMessages(baseMessages);
    await processAIResponse(text, image, baseMessages);
  };

  const handleRetry = () => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg.isError) return;

    const userMsg = messages[messages.length - 2];
    if (!userMsg || userMsg.role !== Role.USER) return;

    const messagesWithoutError = messages.slice(0, -1);
    setMessages(messagesWithoutError);
    processAIResponse(userMsg.text, userMsg.image, messagesWithoutError);
  };

  const handleClearChat = () => {
    setActiveSessionId(null);
    setMessages([{
      id: uuidv4(),
      role: Role.MODEL,
      text: MODE_CONFIG[currentMode].welcome[language],
    }]);
    // Note: We stay in the current mode
  };

  const handleLoadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setCurrentMode(session.mode || StudyMode.EXPLANATION);
  };

  const isDarkMode = !!extensions['dark_mode'];

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onClearChat={handleClearChat}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        language={language}
        onLanguageChange={setLanguage}
        history={history}
        onLoadSession={handleLoadSession}
        activeSessionId={activeSessionId}
        onOpenExtensions={() => setIsExtensionModalOpen(true)}
        onOpenProgress={() => setIsProgressModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => handleToggleExtension('dark_mode')}
        themeColor={currentTheme}
      />
      
      <ImageModal 
        imageUrl={zoomedImage} 
        onClose={() => setZoomedImage(null)} 
      />

      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        enabledExtensions={extensions}
        onToggle={handleToggleExtension}
        language={language}
        themeColor={currentTheme}
      />

      <ProgressModal 
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        history={history}
        language={language}
        themeColor={currentTheme}
      />

      {/* Header */}
      <header className={`border-b px-4 py-3 flex items-center justify-between shadow-sm z-10 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          {/* Menu Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`p-1.5 -ml-2 rounded-lg transition-all active:scale-95 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Logo - Added here */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:rotate-12" />
              <div>
                <h1 className={`font-bold text-sm sm:text-base leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  NCTB Assistant
                </h1>
                <p className={`text-[10px] sm:text-xs text-${currentTheme}-500 font-medium transition-colors duration-300`}>
                  {MODE_LABELS[currentMode][language]}
                </p>
              </div>
          </div>
        </div>
        <div className={`hidden sm:block text-xs px-2 py-1 rounded transition-colors ${isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-400 bg-gray-100'}`}>
          Study Companion
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          
          <div className="space-y-4 pb-4 mt-2">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onImageClick={setZoomedImage}
                language={language}
                onRetry={msg.isError ? handleRetry : undefined}
                themeColor={currentTheme}
              />
            ))}
            {isLoading && (
               <div className="flex justify-start mb-6 animate-fade-in-up">
                 <div className={`p-4 rounded-2xl rounded-bl-none shadow-sm border flex gap-2 items-center text-sm font-medium ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} text-${currentTheme}-600 transition-colors duration-300`}>
                    <div className={`w-2 h-2 bg-${currentTheme}-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 bg-${currentTheme}-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 bg-${currentTheme}-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                    {t.thinking}
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="max-w-3xl mx-auto w-full z-10">
        <InputArea 
          onSend={handleSendMessage} 
          isLoading={isLoading} 
          onAudioTranscript={() => {}} 
          language={language}
          themeColor={currentTheme}
          placeholder={MODE_CONFIG[currentMode].placeholder[language]}
          suggestions={MODE_CONFIG[currentMode].suggestions}
        />
        <div className={`text-center text-[10px] py-2 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
          AI can make mistakes. Check your NCTB textbooks for confirmation.
        </div>
      </footer>
    </div>
  );
}

export default App;