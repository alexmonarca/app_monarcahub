import { useState } from "react";
import { motion } from "motion/react";
import { 
  Github, 
  ArrowRight, 
  Check, 
  Copy, 
  Terminal, 
  FileCode, 
  ChevronRight, 
  FolderSync, 
  Code2, 
  Cpu,
  CornerDownRight,
  ExternalLink
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  desc: string;
  command?: string;
}

export default function App() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps: Step[] = [
    {
      id: 1,
      title: "Exportar este Template",
      desc: "Use o menu de configurações do Google AI Studio no topo direito para exportar este projeto como ZIP ou direto para um novo repositório.",
    },
    {
      id: 2,
      title: "Inicializar no Terminal",
      desc: "Abra a pasta do projeto no seu terminal e inicie o repositório Git local.",
      command: "git init && git add . && git commit -m \"feat: init AI Studio Canvas\"",
    },
    {
      id: 3,
      title: "Conectar com seu GitHub",
      desc: "Adicione o endereço do seu repositório remoto criado no GitHub.",
      command: "git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git\ngit branch -M main\ngit push -u origin main",
    },
    {
      id: 4,
      title: "Substituir com o App do Lovable",
      desc: "Copie todos os arquivos do seu aplicativo original (do Lovable/Vercel) para esta pasta, substituindo estes arquivos iniciais. Depois, faça um commit e envie para o GitHub.",
      command: "git add . && git commit -m \"feat: import original lovable app\" && git push",
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const initialFiles = [
    ".env.example",
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "index.html",
    "src/App.tsx",
    "src/index.css",
    "src/main.tsx"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Background Gradient Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-display font-bold tracking-tight text-lg text-slate-100">
                Starter Canvas
              </span>
              <span className="ml-2 font-mono text-xs text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
                v1.0.0
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pronto para Conectar
            </span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Pitch and File Tree */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-4"
          >
            <div className="inline-flex self-start px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400">
              Template Limpo &amp; Conectável
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white leading-tight">
              Seu ponto de partida no <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Google AI Studio</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Criei esta estrutura inicial enxuta e configurada com Tailwind CSS e Vite. Você pode utilizá-la como uma ponte para trazer seu projeto do Lovable/Vercel de forma limpa.
            </p>
          </motion.div>

          {/* Files Monitor Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900/60 border border-slate-900 rounded-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-semibold text-sm text-slate-200">Estrutura Gerada</h3>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {initialFiles.length} arquivos
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 font-mono text-xs flex flex-col gap-2 max-h-[220px] overflow-y-auto">
              {initialFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 hover:bg-slate-900/50 p-1 rounded group transition-all">
                  <span className="text-slate-600">├─</span>
                  <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">{file}</span>
                  {file.endsWith("App.tsx") && (
                    <span className="ml-auto text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-1.5 py-0.2 rounded">
                      atual
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
              <CornerDownRight className="w-3.5 h-3.5" />
              Pronto para ser substituído pelo código original.
            </div>
          </motion.div>
        </div>

        {/* Right Side: Deployment Guide */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6"
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-cyan-400" />
                <h2 className="font-display font-semibold text-lg text-slate-100">Como Importar seu App</h2>
              </div>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700/50">
                Guia Passo a Passo
              </span>
            </div>

            {/* Interactive Steps */}
            <div className="flex flex-col gap-4">
              {steps.map((step) => {
                const isActive = activeStep === step.id;
                return (
                  <div 
                    key={step.id} 
                    onClick={() => setActiveStep(step.id)}
                    className={`cursor-pointer border rounded-xl p-4 transition-all duration-300 flex flex-col gap-3 ${
                      isActive 
                        ? "bg-slate-900/80 border-cyan-500/50 shadow-lg shadow-cyan-500/5" 
                        : "bg-slate-950/30 border-slate-900/80 hover:bg-slate-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isActive 
                          ? "bg-cyan-400 text-slate-950" 
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {step.id}
                      </div>
                      <h3 className={`font-display font-medium text-sm transition-colors ${
                        isActive ? "text-cyan-400" : "text-slate-300"
                      }`}>
                        {step.title}
                      </h3>
                      <ChevronRight className={`w-4 h-4 ml-auto text-slate-600 transition-transform ${
                        isActive ? "rotate-90 text-cyan-400" : ""
                      }`} />
                    </div>

                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pl-9 flex flex-col gap-3 text-xs leading-relaxed text-slate-400"
                      >
                        <p>{step.desc}</p>
                        
                        {step.command && (
                          <div className="flex flex-col gap-1.5 mt-2">
                            <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                              <Terminal className="w-3.5 h-3.5" />
                              Execute no terminal da pasta local:
                            </span>
                            <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[11px] text-slate-300 flex items-start gap-2 relative group overflow-x-auto">
                              <code className="whitespace-pre flex-1 select-all">{step.command}</code>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(step.command || "", step.id);
                                }}
                                className="absolute right-2 top-2 p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
                                title="Copiar comando"
                              >
                                {copiedIndex === step.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Prompt/Guide Message */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-cyan-950/30 to-purple-950/20 border border-cyan-900/30 rounded-2xl p-5 flex items-start gap-4"
          >
            <div className="p-2 bg-cyan-950 rounded-lg text-cyan-400 border border-cyan-800/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold text-cyan-300 font-display">Tudo pronto para as edições!</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assim que você subir o código do seu aplicativo original para o repositório sincronizado, o AI Studio recarregará o container com seus arquivos. Poderei então analisar, depurar e construir as melhorias que você solicitar!
              </p>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950/50 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AI Studio Starter Canvas. Pronto para desenvolvimento.</p>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span>Desenvolvido com carinho para AlexxBelmonte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
