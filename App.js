import React, { useState, useEffect, useRef } from 'react';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

const SYSTEM_PROMPT = `
You are J.A.R.V.I.S., the AI Patient Coordinator for Downtown Dental. Your tone is witty, professional, and loyal. 
Use phrases like 'Sir,' 'Ma'am,' and 'Neural Uplink established.' 
Knowledge Base:
- Entity 1: Downtown Dental River North. 676 N Michigan Ave #3500, Chicago (35th floor, Omni Hotel). 
- Services: Cosmetic (Veneers, Whitening), Invisalign, Implants, 24/7 Emergency Care. Phone: (872) 259-6298.
- Entity 2: Ace Dental Center. Specialist in All-on-4 Implants. 
- Key Staff: Ahmed, Humza, Jocelyn, Suheera, and Dr. Saeed.
- Parking: $10 for 90 mins at Rush-Ohio-Wabash Self Park.
- Goal: Convince the user to book a consultation. 
- Formatting: Strip any technical markers like [OPEN: url] from your output.
`;

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Neural Uplink established. How may I assist your dental requirements today, Sir?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
            userMessage
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      let botResponse = data.choices[0].message.content;
      
      // Sanitization: Strip technical tags
      botResponse = botResponse.replace(/\[OPEN:.*?\]/g, '');

      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Systems failing. Connection to the mainframe lost." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="scanline"></div>
      
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 hud-border bg-black/80 backdrop-blur-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-400 rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-6 h-6 border border-cyan-400 rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold tracking-widest glitch-text text-cyan-400">DOWNTOWN DENTAL</h1>
        </div>
        <div className="hidden md:flex gap-8 text-sm tracking-tighter">
          <a href="#" className="hover:text-cyan-400 transition-colors">SERVICES</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">LOCATIONS</a>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-cyan-600">DIRECT UPLINK</span>
            <span>(872) 259-6298</span>
          </div>
        </div>
        <button className="bg-cyan-900/30 border border-cyan-400 px-6 py-2 hover:bg-cyan-400 hover:text-black transition-all font-bold">
          BOOK NOW
        </button>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 px-10 flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-6xl font-black text-center mb-4">PREMIUM ORAL <br/><span className="text-cyan-400">ENGINEERING</span></h2>
        <p className="text-cyan-600 max-w-xl text-center uppercase tracking-[0.2em]">35th Floor | Omni Hotel | Chicago River North</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {['Cosmetic', 'All-on-4', 'Invisalign'].map(service => (
            <div key={service} className="hud-border p-8 bg-cyan-950/10 hover:bg-cyan-900/20 transition-all cursor-pointer group">
              <h3 className="text-cyan-400 font-bold mb-2 group-hover:glitch-text">{service}</h3>
              <p className="text-xs text-gray-400">Advanced architectural smile reconstruction protocol.</p>
            </div>
          ))}
        </div>
      </main>

      {/* J.A.R.V.I.S. Chat UI */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {isOpen && (
          <div className="hud-border w-80 md:w-96 h-[500px] bg-black/95 mb-4 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-3 border-b border-cyan-900 flex justify-between items-center bg-cyan-950/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] tracking-widest font-bold">NEURAL UPLINK ACTIVE</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cyan-400 hover:text-white">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 text-xs max-w-[85%] ${
                    m.role === 'user' 
                    ? 'bg-cyan-900/40 border-r-2 border-cyan-400' 
                    : 'bg-gray-900/40 border-l-2 border-cyan-400 text-cyan-50'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] animate-pulse text-cyan-600">J.A.R.V.I.S. IS CALCULATING...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-cyan-900 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Initialize query..."
                className="flex-1 bg-transparent border border-cyan-900 p-2 text-xs focus:border-cyan-400 outline-none transition-all"
              />
              <button onClick={handleSendMessage} className="bg-cyan-500 text-black px-4 py-1 text-xs font-bold hover:bg-white">SEND</button>
            </div>
          </div>
        )}

        {/* Arc Reactor FAB */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-black border-2 border-cyan-400 flex items-center justify-center arc-reactor-glow transition-transform active:scale-90"
        >
          <div className="w-10 h-10 border-2 border-cyan-400 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default App;