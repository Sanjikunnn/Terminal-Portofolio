import { jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { flushSync } from "react-dom";

function App() {
  const terminalRef = useRef(null);
  const [term, setTerm] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    if (!isClient || !terminalRef.current) return;
    Promise.all([import("xterm"), import("xterm-addon-fit")]).then(
      ([{ Terminal }, { FitAddon }]) => {
        const newTerm = new Terminal({
          cursorBlink: true,
          rows: 20,
          convertEol: true,
          theme: { background: "#1a1a1a", foreground: "#00ffcc", cursor: "#ffcc00" }
        });
        const fitAddon = new FitAddon();
        newTerm.loadAddon(fitAddon);
        newTerm.open(terminalRef.current);
        fitAddon.fit();
        setTerm(newTerm);
        queueAutoType(newTerm, [
          { text: "✨ Welcome to My Terminal Portfolio! ✨\n\n", delay: 50 },
          { text: "Type 'help' to see available commands.\n\n", delay: 50 }
        ]);
        const resizeHandler = () => fitAddon.fit();
        window.addEventListener("resize", resizeHandler);
        return () => window.removeEventListener("resize", resizeHandler);
      }
    );
  }, [isClient]);
  useEffect(() => {
    if (!term) return;
    let command = "";
    const handleData = (data) => {
      if (data === "\r") {
        stopCurrentAudio();
        term.writeln("\nProcessing...");
      
        flushSync(() => setHistory((prev) => [...prev, command.trim()]));
        setHistoryIndex(-1);
      
        setTimeout(() => {
          term.write("\r\x1B[K");
          handleCommand(command.trim(), term);
          command = "";
        }, 500);
      }
      } else if (data === "" && command.length > 0) {
        stopCurrentAudio();
        playBackspaceSound();
        command = command.slice(0, -1);
        term.write("\b \b");
      } else if (data === "\x1B[A" && history.length > 0) {
        setHistoryIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : history.length - 1;
          command = history[newIndex] || "";
          term.write("\r\x1B[K> " + command);
          return newIndex;
        });
      } else if (data === "\x1B[B" && history.length > 0) {
        setHistoryIndex((prev) => {
          const newIndex = prev < history.length - 1 ? prev + 1 : -1;
          command = newIndex !== -1 ? history[newIndex] : "";
          term.write("\r\x1B[K> " + command);
          return newIndex;
        });
      } else if (isValidInput(data)) {
        stopCurrentAudio();
        playBeep();
        command += data;
        term.write(data);
      } else {
        playErrorSound();
      }
    };
    term.onData(handleData);
    return () => {
      term.offData(handleData);
    };
  }, [term]);
  let currentAudio = null;
  let lastAudioTime = 0;
  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  };
  const playAudio = (url) => {
    const now = Date.now();
    if (now - lastAudioTime < 100) return;
    stopCurrentAudio();
    currentAudio = new Audio(url);
    currentAudio.volume = 1;
    currentAudio.play().catch(() => {
    });
    lastAudioTime = now;
  };
  const playErrorSound = () => playAudio("https://www.myinstants.com/media/sounds/tuco-get-out.mp3");
  const playSuccessSound = () => playAudio("https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3");
  const playBackspaceSound = () => playAudio("https://www.myinstants.com/media/sounds/dry-fart.mp3");
  const playBeep = () => {
    if (!window.audioCtx) {
      window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (window.audioCtx.state === "suspended") {
      window.audioCtx.resume();
    }
    const oscillator = window.audioCtx.createOscillator();
    const gainNode = window.audioCtx.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(500, window.audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, window.audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(window.audioCtx.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 50);
  };
  const isValidInput = (data) => /^[a-zA-Z0-9\s.,?!@#$%^&*()_+=-]$/.test(data);
  const queueAutoType = async (terminal, texts) => {
    terminal.reset();
    terminal.write("\n");
    for (const { text, delay } of texts) {
      await new Promise((resolve) => autoType(terminal, text, delay, resolve));
    }
    terminal.write("\n> ");
  };
  const autoType = (terminal, text, delay = 50, callback = null) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        terminal.write(text[i++]);
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, delay);
  };
  const handleCommand = (cmd, terminal) => {
    const commands = {
      help: [
        "Available commands:\n",
        "- helpp: Show this help message\n",
        "- aboutt: Show about me info\n",
        "- projectss: List my projects\n",
        "- clearr: Clear the terminal\n\n"
      ],
      about: [
        "Hi, I'm Faizal Muhamad Iqbal 👋\n\n",
        "Freelance Fullstack Web Dev 💼\n",
        "26 y/o from Indonesia 🏠\n",
        "Bachelor Degree in Information System🎓\n",
        "Faculty of Computer Science 🎓\n",
        "Universitas Insan Pembangunan Indonesia🎓\n",
        "Laravel, Javascript, TypeScript ⚡\n",
        "Tech & Coding Enthusiast 💻\n",
        "Cybersecurity Enthusiast 🔐\n",
        "AI & Automation Enthusiast 🤖\n\n",
        "Contact me in ⇙\n",
        "GitHub: \x1B]8;;https://github.com/Sanjikunnn\x1B\\Sanjikunnn\x1B]8;;\x1B\\\n",
        "LinkedIn: \x1B]8;;https://www.linkedin.com/in/faizal-muhamad-iqbal-4851361b2\x1B\\Faizal-Muhamad-Iqbal\x1B]8;;\x1B\\\n"
      ],
      projects: [
        "Projects:\n",
        "1. Khodamku Website 👹  - \x1B]8;;https://khodamku-coral.vercel.app\x1B\\Khodamku\x1B]8;;\x1B\\\n",
        "2. Yukita Puasa 😇  - \x1B]8;;https://yukitapuasa.vercel.app\x1B\\Yukita Puasa\x1B]8;;\x1B\\\n",
        "3. Angkringan Koncodewe 🛒  - \x1B]8;;http://angkringan-koncodewe.rf.gd\x1B\\Angkringan-Koncodewe\x1B]8;;\x1B\\\n",
        "4. Aku dan Kamu 💘  - \x1B]8;;https://bersamasicantikk.vercel.app\x1B\\Website-Bucin\x1B]8;;\x1B\\\n\n"
      ]
    };
    if (cmd === "clear") {
      terminal.clear();
      return;
    }
    if (commands[cmd]) {
      playSuccessSoundWithDelay();
      queueAutoType(terminal, commands[cmd].map((text) => ({ text, delay: 20 })));
    } else {
      playErrorSound();
      queueAutoType(terminal, [{ text: `Command not found: ${cmd}

`, delay: 30 }]);
    }
  };
  const playSuccessSoundWithDelay = () => setTimeout(playSuccessSound, 100);
  if (!isClient) return null;
  return /* @__PURE__ */ jsx("div", { className: "terminal-container", children: /* @__PURE__ */ jsx("div", { ref: terminalRef }) });
}
function render(_url) {
  const html = renderToString(
    /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(App, {}) })
  );
  return { html };
}
export {
  render
};
