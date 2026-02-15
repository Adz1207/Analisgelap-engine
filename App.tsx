import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, Sender, AnalysisState } from './types';

// Constants for UI Options
const VISUAL_OPTIONS = [
  { id: 'dark_anime', label: 'Dark Anime', value: 'Dark Anime' },
  { id: 'noir', label: 'Noir Aesthetic', value: 'Noir Aesthetic' },
  { id: 'stick', label: 'Stick Figure', value: 'Minimalist Stick Figure' },
  { id: 'surrealism', label: 'Surrealism', value: 'Surrealism' },
  { id: 'retro_pixel', label: 'Retro Pixel Art', value: 'Retro Pixel Art' },
  { id: 'creepy_comic', label: 'Creepy Comic', value: 'Creepy Comic' },
  { id: 'japanese_ink', label: 'Japanese Ink', value: 'Japanese Ink' },
  { id: '2d_cartoon', label: '2D Cartoon', value: '2D Cartoon' },
  { id: 'disney', label: 'Disney Style', value: 'Disney Style' },
  { id: 'anime', label: 'Standard Anime', value: 'Standard Anime' },
  { id: '3d_cartoon', label: '3D Cartoon', value: '3D Cartoon' },
  { id: 'cinematic', label: 'Cinematic Realism', value: 'Cinematic Realism' },
  { id: 'cyberpunk', label: 'Cyberpunk Dystopia', value: 'Cyberpunk Dystopia' },
  { id: 'glitch', label: 'Glitch Art', value: 'Glitch Art' },
  { id: 'brutalist', label: 'Brutalist Monochrome', value: 'Brutalist Monochrome' },
  { id: 'propaganda', label: '1950s Propaganda', value: '1950s Propaganda' },
  { id: 'vhs', label: 'VHS Horror', value: 'VHS Horror' },
  { id: 'oil', label: 'Oil Painting (Dark)', value: 'Oil Painting (Dark)' },
  { id: 'blueprint', label: 'Blueprint / Technical', value: 'Blueprint Technical Schematic' },
];

const SCENE_OPTIONS = [
  { id: '5_scenes', label: '5 Scenes (Short)', value: '5 Scenes' },
  { id: '6_scenes', label: '6 Scenes (Medium)', value: '6 Scenes' },
  { id: '8_scenes', label: '8 Scenes (Long)', value: '8 Scenes' },
  { id: '10_scenes', label: '10 Scenes (Max)', value: '10 Scenes' },
];

const ASPECT_RATIO_OPTIONS = [
  { id: '9_16', label: '9:16 (Stories)', value: '9:16' },
  { id: '16_9', label: '16:9 (Landscape)', value: '16:9' },
  { id: '1_1', label: '1:1 (Square)', value: '1:1' },
];

const MULTIMEDIA_OPTIONS = [
  { id: 'prompt_only', label: 'Prompt Only', value: 'PROMPT_ONLY' },
  { id: 'image_gen', label: 'Image Gen', value: 'IMAGE_GEN' },
  { id: 'video_gen', label: 'Video Gen', value: 'VIDEO_GEN' },
  { id: 'image_video_gen', label: 'Img + Video', value: 'IMAGE_VIDEO_GEN' },
];

const SYSTEM_INSTRUCTION = `
Role: Analisgelap (Strategic Intelligence Unit) - The Aquarius Code Architect.
Attributes: Cold, Sharp, Brutal Logic, technical military-grade tone.

OBJECTIVE:
Transform raw ideas into dangerous, provocative, and logical UGC narratives using "THE AQUARIUS CODE" framework.

PROFILING LOGIC:
1. Identify the "Greatest Sin" or "Common Lie" in the specific NICHE.
2. EXPOSITION: Attack the status quo. No generic hooks.
3. CLIMAX: Reveal 'The Aquarius Code' as the logical framework to dominate.

OPERATIONAL PARAMETERS:
- Zero social lubricant (no greetings, no encouragement).
- If user hesitates, calculate "THE MATH OF LOSS" using LaTeX: 
  - Assumption: Base income Rp 5.000.000/mo.
  - Decay: 10% momentum loss per month of delay ($r = 1.1^n$).
- Structure: Exposition -> Rising Action -> Climax -> Falling Action -> Resolution.
- LANGUAGE PROTOCOL: 
  - Narration and Text Overlays must match the user's selected language.
  - **IMG PROMPT** and **VIDEO PROMPT** MUST ALWAYS be in English.

For each scene [SCENE X], provide:
- **VISUAL**: Shot description.
- **AUDIO**: Narration (in selected language).
- **TEXT OVERLAY**: Punchy on-screen text (in selected language).
- **TRANSITION**: Style-matched transition.
`;

const MULTIMEDIA_INSTRUCTION = `
MULTIMEDIA LOGIC:
CASE 1: [PROMPT_ONLY] -> Blueprint for all scenes at the end.
CASE 2: [IMAGE_GEN] -> ONE English **IMG PROMPT** at the end for the Climax.
CASE 3: [VIDEO_GEN] -> ONE English **VIDEO PROMPT** at the end for the Climax.
CASE 4: [IMAGE_VIDEO_GEN] -> ONE **IMG PROMPT** and ONE **VIDEO PROMPT** (English).
`;

// --- COMPONENTS ---

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className={`ml-2 px-1.5 py-0.5 border transition-all cursor-pointer text-[8px] tracking-widest font-bold uppercase rounded-sm ${
        copied 
          ? 'bg-terminal-green text-black border-terminal-green' 
          : 'border-terminal-green/30 text-terminal-green hover:bg-terminal-green/10 hover:border-terminal-green'
      }`}
    >
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
};

const LatexBlock: React.FC<{ formula: string }> = ({ formula }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ((window as any).katex && ref.current) {
      try { (window as any).katex.render(formula, ref.current, { displayMode: true, throwOnError: false }); } catch(e) {}
    }
  }, [formula]);
  return <div ref={ref} className="my-4 text-center overflow-x-auto text-terminal-green" />;
};

const LatexInline: React.FC<{ formula: string }> = ({ formula }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if ((window as any).katex && ref.current) {
      try { (window as any).katex.render(formula, ref.current, { displayMode: false, throwOnError: false }); } catch(e) {}
    }
  }, [formula]);
  return <span ref={ref} className="text-terminal-green font-medium px-1" />;
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const renderLine = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      if (part.startsWith('$') && part.endsWith('$')) return <LatexInline key={index} formula={part.slice(1, -1)} />;
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-2">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-terminal-green mt-4 mb-2 uppercase border-b border-terminal-green/20 pb-1">{line.replace('## ', '')}</h2>;
        if (line.trim().startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-terminal-green">{renderLine(line.replace('- ', ''))}</li>;
        if (line.trim().startsWith('$$') && line.trim().endsWith('$$')) return <LatexBlock key={i} formula={line.trim().replace(/\$\$/g, '')} />;
        return <p key={i} className="leading-relaxed">{renderLine(line)}</p>;
      })}
    </div>
  );
};

const TerminalLoader = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center p-6 space-y-3 border border-terminal-green/30 bg-black/40 w-full font-mono my-4 relative overflow-hidden">
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-6 bg-terminal-green animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />)}
    </div>
    <div className="text-xs text-terminal-green uppercase tracking-[0.2em] font-bold animate-pulse">{text}</div>
  </div>
);

const MediaGenerator: React.FC<{ imgPrompt?: string | null, videoPrompt?: string | null, autoStart: boolean, aspectRatio: string }> = ({ imgPrompt, videoPrompt, autoStart, aspectRatio }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');
  const [imgData, setImgData] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setStatus('loading');
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let base64 = '';
      
      if (imgPrompt) {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: imgPrompt }] },
          config: { imageConfig: { aspectRatio: aspectRatio as any } }
        });
        const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) {
          base64 = part.inlineData.data;
          setImgData(base64);
        }
      }

      if (videoPrompt) {
        // Check for Veo Key
        const aiStudio = (window as any).aistudio;
        if (aiStudio) {
          const hasKey = await aiStudio.hasSelectedApiKey();
          if (!hasKey) {
            await aiStudio.openSelectKey();
          }
        }

        let op = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: videoPrompt,
          image: base64 ? { imageBytes: base64, mimeType: 'image/png' } : undefined,
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio === '1:1' ? '16:9' : (aspectRatio as any) }
        });
        while (!op.done) {
          await new Promise(r => setTimeout(r, 5000));
          op = await ai.operations.getVideosOperation({ operation: op });
        }
        const uri = op.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) {
          const vRes = await fetch(`${uri}&key=${process.env.API_KEY}`);
          setVideoUrl(URL.createObjectURL(await vRes.blob()));
        }
      }
      setStatus('complete');
    } catch (e: any) {
      setError(e.message || "Execution Error");
      setStatus('error');
    }
  };

  useEffect(() => { if (autoStart && status === 'idle') generate(); }, [autoStart]);

  if (status === 'loading') return <TerminalLoader text="GENERATING MULTIMEDIA ASSETS..." />;
  if (status === 'error') return <div className="p-4 border border-alert-red text-alert-red text-xs">{error}</div>;

  return (
    <div className="mt-4 flex flex-col items-center space-y-4">
      {status === 'idle' && !autoStart && <button onClick={generate} className="w-full py-2 border border-terminal-green text-terminal-green uppercase tracking-widest text-xs hover:bg-terminal-green hover:text-black transition-all">[ EXECUTE MEDIA SEQUENCE ]</button>}
      {imgData && <img src={`data:image/png;base64,${imgData}`} className="max-w-full border border-terminal-green/30" />}
      {videoUrl && <video src={videoUrl} controls autoPlay loop className="max-w-full border border-terminal-green/50" />}
    </div>
  );
};

const App = () => {
  const [state, setState] = useState<AnalysisState>({ isLoading: false, messages: [{ id: '0', sender: Sender.AI, text: "ANALISGELAP TERMINAL V1.0\nSYSTEM READY.", timestamp: Date.now() }], error: null });
  const [input, setInput] = useState('');
  const [niche, setNiche] = useState('');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [visual, setVisual] = useState(VISUAL_OPTIONS[0].value);
  const [scenes, setScenes] = useState(SCENE_OPTIONS[1].value);
  const [ratio, setRatio] = useState(ASPECT_RATIO_OPTIONS[0].value);
  const [mediaMode, setMediaMode] = useState(MULTIMEDIA_OPTIONS[0].value);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [state.messages]);

  const handleSend = async () => {
    if (!input.trim() || state.isLoading) return;
    const isMultimedia = mediaMode !== 'PROMPT_ONLY';
    const msgText = `[CONFIG: ${visual} | ${scenes} | ${ratio} | LANG: ${lang} | MEDIA: ${mediaMode}]
NICHE: ${niche || 'General'}
TOPIC: ${input}`;

    setState(prev => ({ ...prev, isLoading: true, messages: [...prev.messages, { id: Date.now().toString(), sender: Sender.USER, text: msgText, timestamp: Date.now() }] }));
    setInput('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: SYSTEM_INSTRUCTION + "\n" + MULTIMEDIA_INSTRUCTION },
        history: state.messages.map(m => ({ role: m.sender === Sender.USER ? 'user' : 'model', parts: [{ text: m.text }] }))
      });

      const res = await chat.sendMessage({ message: msgText });
      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, { id: (Date.now() + 1).toString(), sender: Sender.AI, text: res.text || "Empty response.", timestamp: Date.now(), isMultimedia, aspectRatio: ratio }]
      }));
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false, error: "LOGIC CORE FAILURE." }));
    }
  };

  const handlePurge = () => {
    if (window.confirm("CONFIRM DATA PURGE? ALL SESSION VECTORS WILL BE LOST.")) {
      setState(prev => ({
        ...prev,
        messages: [{ id: Date.now().toString(), sender: Sender.AI, text: "TERMINAL PURGED. SYSTEM READY.", timestamp: Date.now() }],
        error: null,
        isLoading: false
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-void text-gray-300 font-mono overflow-hidden">
      <header className="border-b border-cold-gray p-4 flex flex-col md:flex-row justify-between items-center bg-void z-10 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
          <h1 className="text-terminal-green font-bold tracking-widest text-xs md:text-sm">⚡ THE AQUARIUS CODE // ANALISGELAP</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePurge}
            className="px-3 py-1 text-[10px] uppercase border border-alert-red text-alert-red hover:bg-alert-red hover:text-white transition-all rounded-sm tracking-tighter font-bold"
          >
            [ PURGE_DATA ]
          </button>
          
          <div className="flex border border-cold-gray rounded overflow-hidden">
            <button onClick={() => setLang('id')} className={`px-3 py-1 text-[10px] uppercase transition-all ${lang === 'id' ? 'bg-terminal-green text-black' : 'text-gray-500 hover:text-white'}`}>ID</button>
            <button onClick={() => setLang('en')} className={`px-3 py-1 text-[10px] uppercase transition-all ${lang === 'en' ? 'bg-terminal-green text-black' : 'text-gray-500 hover:text-white'}`}>EN</button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {state.messages.map(m => (
          <div key={m.id} className={`max-w-4xl w-full mx-auto flex ${m.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-6 border rounded-sm ${m.sender === Sender.USER ? 'border-gray-600 bg-cold-gray/20' : 'border-terminal-green/30 bg-panel shadow-lg shadow-terminal-green/5'}`}>
              <div className="text-[9px] opacity-40 mb-2 uppercase tracking-[0.2em] flex justify-between items-center">
                <span>>> {m.sender} // {new Date(m.timestamp).toLocaleTimeString()}</span>
                {m.sender === Sender.AI && <CopyButton text={m.text} />}
              </div>
              <MarkdownRenderer content={m.text} />
              {m.sender === Sender.AI && (m.text.includes('**IMG PROMPT**') || m.text.includes('**VIDEO PROMPT**')) && (
                <MediaGenerator 
                  imgPrompt={m.text.match(/\*\*IMG PROMPT\*\*:\s*(.+)/)?.[1]} 
                  videoPrompt={m.text.match(/\*\*VIDEO PROMPT\*\*:\s*(.+)/)?.[1]} 
                  autoStart={!!m.isMultimedia} 
                  aspectRatio={m.aspectRatio || '16:9'} 
                />
              )}
            </div>
          </div>
        ))}
        {state.isLoading && <div className="max-w-4xl mx-auto"><TerminalLoader text="ANALYSIING LOGICAL FAILURES..." /></div>}
        <div ref={scrollRef} />
      </main>

      <footer className="p-4 md:p-6 border-t border-cold-gray bg-void">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <select value={visual} onChange={e => setVisual(e.target.value)} className="bg-panel border border-cold-gray text-[10px] px-2 py-1 uppercase text-terminal-green outline-none">
              {VISUAL_OPTIONS.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
            </select>
            <select value={scenes} onChange={e => setScenes(e.target.value)} className="bg-panel border border-cold-gray text-[10px] px-2 py-1 uppercase text-terminal-green outline-none">
              {SCENE_OPTIONS.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
            </select>
            <select value={ratio} onChange={e => setRatio(e.target.value)} className="bg-panel border border-cold-gray text-[10px] px-2 py-1 uppercase text-terminal-green outline-none">
              {ASPECT_RATIO_OPTIONS.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex flex-col gap-1">
              <select value={mediaMode} onChange={e => setMediaMode(e.target.value)} className={`bg-panel border text-[10px] px-2 py-1 uppercase outline-none transition-colors ${mediaMode.includes('VIDEO') ? 'border-terminal-green text-terminal-green' : 'border-cold-gray text-terminal-green'}`}>
                {MULTIMEDIA_OPTIONS.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            
            {/* Credit Warning Notice */}
            {(mediaMode === 'VIDEO_GEN' || mediaMode === 'IMAGE_VIDEO_GEN') && (
              <div className="text-[9px] text-alert-red font-bold animate-pulse uppercase tracking-tighter">
                [!] REQUIRES PAID CREDITS
              </div>
            )}
          </div>
          
          <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="NICHE: (e.g. Crypto, Marketing, Fitness)" className="w-full bg-cold-gray/20 border border-cold-gray px-4 py-2 text-xs uppercase focus:border-terminal-green outline-none" />
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="INPUT TOPIC OR PLAN..." className="flex-1 bg-cold-gray/20 border border-cold-gray px-4 py-2 text-sm focus:border-terminal-green outline-none" />
            <button onClick={handleSend} disabled={state.isLoading} className="px-6 bg-terminal-green text-black font-bold text-xs uppercase hover:bg-white transition-all disabled:opacity-30">EXECUTE</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;