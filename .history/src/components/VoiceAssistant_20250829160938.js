import React, { useEffect, useMemo, useRef, useState } from 'react';

const defaultLanguages = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi (IN)' },
  { code: 'te-IN', label: 'Telugu (IN)' },
  { code: 'ta-IN', label: 'Tamil (IN)' },
  { code: 'fr-FR', label: 'French (FR)' },
  { code: 'es-ES', label: 'Spanish (ES)' }
];

const VoiceAssistant = ({ onTranscript, ttsText }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('va_lang') || 'en-US');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('va_lang', lang);
  }, [lang]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      if (onTranscript) onTranscript(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => { rec.abort(); };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!supported) return;
    if (listening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch (_) {
        // ignore
      }
    }
  };

  const speak = () => {
    if (!ttsText) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utter = new SpeechSynthesisUtterance(ttsText);
    utter.lang = lang;
    synth.speak(utter);
  };

  return (
    <div className="flex items-center gap-2">
      <select value={lang} onChange={(e) => setLang(e.target.value)} className="input-field py-2 px-2 text-sm w-40">
        {defaultLanguages.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      <button type="button" onClick={toggleListening} className={`btn-secondary ${listening ? 'bg-primary-100 text-primary-700' : ''}`}>{listening ? 'Stop' : 'Speak'}</button>
      <button type="button" onClick={speak} className="btn-secondary">Listen</button>
      {!supported && <span className="text-xs text-academic-500">Voice not supported</span>}
    </div>
  );
};

export default VoiceAssistant;
