import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Globe,
  MessageCircle,
  RefreshCw,
  Unplug,
  ChevronDown,
  ChevronUp,
  Instagram as InstagramIcon,
  Lock,
  ShieldCheck,
  X,
  Smartphone,
  MapPin,
  Building2,
  AlertCircle,
  Plus,
  Search,
} from "lucide-react";

const WEBHOOK_META_ONBOARDING_INPUT_URL = "https://webhook.monarcahub.com/webhook/meta-onboarding-input";


function StatusBadge({ connected, labelConnected = "Online", labelDisconnected = "Offline" }) {
  return (
    <span
      className={
        "text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 " +
        (connected
          ? "bg-success/10 text-success border-success/30"
          : "bg-muted/30 text-muted-foreground border-border")
      }
    >
      <Circle className={"w-2.5 h-2.5 " + (connected ? "fill-success text-success" : "fill-muted-foreground text-muted-foreground")} />
      {connected ? labelConnected : labelDisconnected}
    </span>
  );
}

function Step({ done, title, children }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3">
      <div className="mt-0.5">
        <CheckCircle2 className={"w-5 h-5 " + (done ? "text-success" : "text-muted-foreground")} />
      </div>
      <div className="min-w-0">
        <div className={"font-medium text-sm " + (done ? "text-foreground" : "text-muted-foreground")}>{title}</div>
        {children && <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

export default function ConnectionsPage({
  planName,
  isTrialPlan,
  wantsOfficialApi,
  onOpenPlansTab,

  // Extras (Assinatura)
  extraChannels = 0,

  // WhatsApp (MonarcaHub)
  onOpenWhatsAppConnectUnofficial,
  whatsappUnofficialStatus,

  // WhatsApp (API Oficial)
  onOpenWhatsAppConnectOfficial,
  whatsappOfficialStatus,

  // Gestão (já conectado)
  onWhatsAppDisconnect,
  onWhatsAppRestart,
  onCheckStatus,

  // Novos parâmetros para conexões múltiplas
  gymData,
  onSaveGymData,
  instanceName,
}) {
  const [showAlreadyConnected, setShowAlreadyConnected] = useState(false);
  const [tutorialCollapsed, setTutorialCollapsed] = useState(true);

  const [selectedNumberId, setSelectedNumberId] = useState("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const registeredNumbers = useMemo(() => {
    const list = [];
    
    // 1. Principal / Sede
    if (gymData?.phone) {
      const isOfficialConnected = whatsappOfficialStatus === "connected";
      const isMainOfficial = Boolean(gymData.use_official_api || isOfficialConnected);
      list.push({
        id: "main",
        type: "main",
        title: "Número Principal (Sede)",
        phone: gymData.phone,
        useOfficialApi: isMainOfficial,
        // For standard (unofficial), use the global status whatsappUnofficialStatus
        // For official, use global status whatsappOfficialStatus
        status: isMainOfficial ? whatsappOfficialStatus : whatsappUnofficialStatus,
        instanceName: instanceName,
        label: "Número Principal",
      });
    } else {
      list.push({
        id: "main",
        type: "main",
        title: "Número Principal (Sede)",
        phone: "",
        useOfficialApi: false,
        status: "disconnected",
        instanceName: instanceName,
        label: "Número Principal",
        missing: true,
      });
    }

    // 2. Filiais
    if (Array.isArray(gymData?.branches)) {
      gymData.branches.forEach((branch) => {
        if (branch.phone) {
          list.push({
            id: branch.id,
            type: "branch",
            title: branch.address ? `Filial: ${branch.address}` : `Filial #${branch.id}`,
            phone: branch.phone,
            useOfficialApi: Boolean(branch.use_official_api),
            status: branch.connection_status || "disconnected",
            instanceName: `${instanceName}_branch_${branch.id}`,
            label: branch.address ? `Filial: ${branch.address}` : `Filial #${branch.id}`,
            branchId: branch.id,
          });
        } else {
          list.push({
            id: branch.id,
            type: "branch",
            title: branch.address ? `Filial: ${branch.address}` : `Filial #${branch.id}`,
            phone: "",
            useOfficialApi: false,
            status: "disconnected",
            instanceName: `${instanceName}_branch_${branch.id}`,
            label: branch.address ? `Filial: ${branch.address}` : `Filial #${branch.id}`,
            branchId: branch.id,
            missing: true,
          });
        }
      });
    }

    return list;
  }, [gymData, whatsappUnofficialStatus, whatsappOfficialStatus, instanceName]);

  const filteredNumbers = useMemo(() => {
    if (!searchQuery.trim()) return registeredNumbers;
    const query = searchQuery.toLowerCase();
    return registeredNumbers.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(query);
      const phoneMatch = item.phone?.toLowerCase().includes(query);
      const labelMatch = item.label?.toLowerCase().includes(query);
      return titleMatch || phoneMatch || labelMatch;
    });
  }, [registeredNumbers, searchQuery]);

  const activeSelectedNumber = useMemo(() => {
    const found = registeredNumbers.find((n) => n.id === selectedNumberId);
    return found || registeredNumbers[0] || { id: "main", type: "main", title: "Número Principal (Sede)", phone: gymData?.phone, useOfficialApi: Boolean(gymData?.use_official_api), status: "disconnected" };
  }, [registeredNumbers, selectedNumberId, gymData]);

  const handleToggleOfficialApiForNumber = (item, isOfficial) => {
    if (item.type === "main") {
      const updated = { ...gymData, use_official_api: isOfficial };
      onSaveGymData?.(updated);
    } else if (item.type === "branch" && item.branchId) {
      const updatedBranches = gymData.branches.map((b) =>
        b.id === item.branchId ? { ...b, use_official_api: isOfficial } : b
      );
      const updated = { ...gymData, branches: updatedBranches };
      onSaveGymData?.(updated);
    }
  };
  const [isConciergeIntroOpen, setIsConciergeIntroOpen] = useState(false);
  const [isConciergeFormOpen, setIsConciergeFormOpen] = useState(false);
  const [isConciergeSubmitting, setIsConciergeSubmitting] = useState(false);
  const [conciergeError, setConciergeError] = useState("");
  const [conciergeSuccess, setConciergeSuccess] = useState("");
  const [conciergeForm, setConciergeForm] = useState({
    instagramLogin: "",
    instagramPassword: "",
    backupCode: "",
  });

  const whatsappUnofficialConnected = (whatsappUnofficialStatus ?? "disconnected") === "connected";
  const whatsappOfficialConnected = (whatsappOfficialStatus ?? "disconnected") === "connected";
  const whatsappConnected = whatsappUnofficialConnected || whatsappOfficialConnected;

  const showOfficialConnect = !isTrialPlan && Boolean(wantsOfficialApi);

  const openUnofficialConnect = () => {
    // Se já está online, o clique em "Conectar" deve abrir o modal de gestão
    // (desconectar/reiniciar), independente do plano.
    if (whatsappUnofficialConnected) {
      setShowAlreadyConnected(true);
      return;
    }
    onOpenWhatsAppConnectUnofficial?.();
  };

  const openOfficialConnect = () => {
    onOpenWhatsAppConnectOfficial?.({ mode: "whatsapp" });
  };

  const openInstagramConnect = () => {
    onOpenWhatsAppConnectOfficial?.({ mode: "instagram" });
  };

  const openBothConnect = () => {
    onOpenWhatsAppConnectOfficial?.({ mode: "both" });
  };

  const openInstagramConciergeIntro = () => {
    setConciergeError("");
    setConciergeSuccess("");
    setIsConciergeIntroOpen(true);
  };

  const handleConfirmConciergeIntro = () => {
    setIsConciergeIntroOpen(false);
    setIsConciergeFormOpen(true);
  };

  const closeConciergeForm = () => {
    if (isConciergeSubmitting) return;
    setIsConciergeFormOpen(false);
  };

  const handleConciergeInputChange = (field, value) => {
    setConciergeForm((prev) => ({ ...prev, [field]: value }));
    if (conciergeError) setConciergeError("");
    if (conciergeSuccess) setConciergeSuccess("");
  };

  const submitConciergeOnboarding = async (event) => {
    event.preventDefault();

    const instagramLogin = String(conciergeForm.instagramLogin || "").trim();
    const instagramPassword = String(conciergeForm.instagramPassword || "").trim();
    const backupCode = String(conciergeForm.backupCode || "").trim();

    if (!instagramLogin || !instagramPassword || !backupCode) {
      setConciergeError("Preencha login, senha e código reserva de autenticação.");
      return;
    }

    setIsConciergeSubmitting(true);
    setConciergeError("");
    setConciergeSuccess("");

    try {
      const response = await fetch(WEBHOOK_META_ONBOARDING_INPUT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "connections_instagram_concierge",
          channel: "instagram",
          plan_name: planName || null,
          instagram_login: instagramLogin,
          instagram_password: instagramPassword,
          instagram_backup_code: backupCode,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook retornou status ${response.status}`);
      }

      setConciergeSuccess("Dados enviados com sucesso. Nosso time concierge seguirá com os próximos passos.");
      setConciergeForm({ instagramLogin: "", instagramPassword: "", backupCode: "" });
    } catch (error) {
      console.error("Erro ao enviar onboarding concierge do Instagram:", error);
      setConciergeError("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setIsConciergeSubmitting(false);
    }
  };

  const instagramUnlocked = Number(extraChannels || 0) >= 1;

  const checklist = useMemo(() => {
    const steps = [];
    steps.push({
      id: "choose",
      done: true,
      title: "1) Escolha o tipo de conexão",
      description: "Aqui você vai conectar via MonarcaHub (padrão) ou via API Oficial da Meta (se habilitada no Treinar IA).",
    });
    steps.push({
      id: "connect",
      done: whatsappConnected,
      title: "2) Conecte o WhatsApp",
      description: "Clique em Conectar e finalize o passo a passo (QR Code ou Embedded Signup).",
    });
    steps.push({
      id: "verify",
      done: whatsappConnected,
      title: "3) Verifique se ficou Online",
      description: "Quando estiver Online, você já pode voltar ao Chat e ativar a IA.",
    });
    return steps;
  }, [whatsappConnected]);

  return (
    <main className="max-w-5xl mx-auto animate-in fade-in">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Conexões</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Centralize suas integrações aqui. (Plano atual: <span className="text-foreground">{planName || "—"}</span>)
            </p>
          </div>

        </div>
      </header>

      <section className="flex flex-col lg:flex-row gap-6">
        {/* Coluna esquerda (desktop): Tutorial + Instagram (masonry simples) */}
        <div className="flex flex-col gap-6 lg:w-1/2">
        {/* Tutorial (padrão recolhido) */}
        <div className="order-1 lg:order-none rounded-3xl border border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-[0_0_0_1px_hsl(var(--border))] overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setTutorialCollapsed(!tutorialCollapsed)}>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Tutorial rápido</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Passo a passo para conectar o WhatsApp sem poluir o Chat.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge connected={whatsappConnected} />
                {tutorialCollapsed ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronUp className="w-5 h-5 text-muted-foreground" />}
              </div>
            </div>
          </div>

          {!tutorialCollapsed && (<div className="p-5 space-y-3">
            {checklist.map((s) => (
              <Step key={s.id} done={s.done} title={s.title}>
                {s.description}
              </Step>
            ))}

            <div className="mt-2 rounded-2xl border border-border bg-background/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <div className="text-sm font-medium text-foreground">Vídeo</div>
                <div className="text-xs text-muted-foreground">Veja o passo a passo completo.</div>
              </div>
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/2rgyPJzZXQg"
                  title="Tutorial Conexões"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>)}
        </div>
        {/* Instagram */}
        <div className="order-3 lg:order-none rounded-3xl border border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-[0_0_0_1px_hsl(var(--border))]">
          <div className="p-5 border-b border-border flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">Instagram</h2>
              <p className="mt-1 text-xs text-muted-foreground">Conecte e gerencie seu canal de Direct.</p>
            </div>
            {!instagramUnlocked && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border bg-muted/30 text-muted-foreground border-border">
                <Lock className="w-3.5 h-3.5" /> Bloqueado
              </span>
            )}
          </div>
          <div className="p-5 space-y-3">
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-primary" />
                  <div className="text-sm font-medium text-foreground">Instagram API (Meta)</div>
                </div>
                <StatusBadge connected={false} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {instagramUnlocked
                  ? "Conecte o Instagram via API Oficial da Meta para gerenciar mensagens diretas."
                  : "Para liberar o Instagram, vá em Assinatura → Adicionais → Canais Extras e selecione 1 ou mais."}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={instagramUnlocked ? openInstagramConnect : undefined}
                  disabled={!instagramUnlocked}
                  className="h-10 px-4 rounded-full border border-border bg-background/40 text-foreground hover:bg-background/60 transition-colors text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  title={!instagramUnlocked ? 'Disponível ao contratar "Canais Extras" na aba Assinatura' : undefined}
                >
                  {!instagramUnlocked && <Lock className="w-4 h-4" />}
                  Conectar Instagram
                  <RefreshCw className="w-4 h-4 opacity-70" />
                </button>
                <button
                  type="button"
                  onClick={instagramUnlocked ? openInstagramConciergeIntro : undefined}
                  disabled={!instagramUnlocked}
                  className="h-10 px-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  title={!instagramUnlocked ? 'Disponível ao contratar "Canais Extras" na aba Assinatura' : undefined}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Conectar via concierge
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Coluna direita (desktop): WhatsApp | No mobile vem logo após o tutorial */}
        <div className="order-2 lg:order-none lg:w-1/2">
        <div className="rounded-3xl border border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-[0_0_0_1px_hsl(var(--border))]">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">WhatsApp</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Conecte e gerencie seus canais de atendimento por filial.
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Se houver mais que 2 números cadastrados, mostramos o dropdown/buscador para selecionar */}
            {registeredNumbers.length > 2 && (
              <div className="space-y-3 pb-4 border-b border-border/50">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Selecionar Unidade ou Telefone
                </label>
                
                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-background/50 border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Pesquise por número ou endereço..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="bg-transparent border-0 outline-none text-sm text-foreground w-full placeholder:text-muted-foreground/60"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors mr-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      
                      <div className="absolute left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-border/60 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                        {filteredNumbers.length === 0 ? (
                          <div className="p-3 text-xs text-muted-foreground text-center">
                            Nenhuma unidade ou número encontrado.
                          </div>
                        ) : (
                          filteredNumbers.map((item) => {
                            const Icon = item.type === "main" ? Smartphone : MapPin;
                            const isSelected = item.id === selectedNumberId;
                            const isOnline = item.status === "connected";
                            return (
                              <button
                                key={`${item.type}-${item.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedNumberId(item.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left p-3 flex items-center justify-between gap-3 transition-colors ${
                                  isSelected ? "bg-primary/10 text-primary-foreground" : "hover:bg-muted/50 text-foreground"
                                }`}
                              >
                                <div className="flex gap-2.5 min-w-0">
                                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted/60 text-muted-foreground'}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold truncate">{item.title}</div>
                                    {item.phone ? (
                                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.phone}</div>
                                    ) : (
                                      <div className="text-[10px] text-amber-500 font-medium mt-0.5">Sem telefone</div>
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                  {!item.missing && (
                                    <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-muted-foreground/40"}`} />
                                  )}
                                  {isSelected && (
                                    <span className="text-xs text-primary font-medium">Selecionado</span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Exibe o item ativo selecionado */}
                <div className="flex items-center justify-between gap-2 bg-muted/40 border border-border/50 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground">Unidade selecionada:</span>
                    <span className="font-semibold text-foreground truncate">{activeSelectedNumber?.title}</span>
                  </div>
                  {activeSelectedNumber?.phone && (
                    <span className="font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                      {activeSelectedNumber.phone}
                    </span>
                  )}
                </div>
              </div>
            )}

            {(registeredNumbers.length > 2 ? [activeSelectedNumber].filter(Boolean) : registeredNumbers).map((item) => {
              const isConnected = item.status === "connected";
              const Icon = item.type === "main" ? Smartphone : MapPin;
              
              return (
                <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-border bg-background/40 p-5 space-y-4">
                  {/* Header of the channel card */}
                  <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                    <div className="flex gap-2.5 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{item.title}</div>
                        {item.phone ? (
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.phone}</div>
                        ) : (
                          <div className="text-xs text-amber-500 font-medium flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            Telefone não configurado
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {!item.missing && (
                        <StatusBadge connected={isConnected} />
                      )}
                    </div>
                  </div>

                  {/* Body / Missing alert */}
                  {item.missing ? (
                    <div className="text-xs text-muted-foreground bg-muted/20 border border-border/60 rounded-xl p-3 leading-relaxed">
                      Este número não foi registrado na aba <span className="text-foreground font-medium">Treinar IA</span>. 
                      Para usá-lo e conectá-lo aqui, primeiro informe o telefone na aba correspondente.
                    </div>
                  ) : (
                    <>
                      {/* Connection Type selector */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tipo de Conexão
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
                          <button
                            type="button"
                            onClick={() => {
                              if (!item.useOfficialApi && isConnected) {
                                alert("Você não pode mudar para a API Oficial enquanto a conexão Padrão estiver online/conectada. Por favor, desconecte a conexão Padrão primeiro.");
                                return;
                              }
                              handleToggleOfficialApiForNumber(item, true);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                              item.useOfficialApi
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            API Oficial (Meta)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.useOfficialApi && isConnected) {
                                alert("Você não pode mudar para a conexão Padrão enquanto a API Oficial estiver online/conectada. Por favor, desconecte a API Oficial primeiro.");
                                return;
                              }
                              handleToggleOfficialApiForNumber(item, false);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                              !item.useOfficialApi
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Padrão (MonarcaHub)
                          </button>
                        </div>
                      </div>

                      {/* Connection Actions */}
                      <div className="pt-2">
                        {isConnected ? (
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">
                              Esta conexão está <span className="text-success font-medium">Online</span>. Use as ações abaixo para testar ou reiniciar.
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => onCheckStatus?.(item)}
                                className="h-9 px-3 rounded-xl border border-border bg-background/50 hover:bg-background text-foreground transition-colors text-xs inline-flex items-center gap-1.5"
                                title="Verificar status em tempo real"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Verificar Status
                              </button>
                              <button
                                type="button"
                                onClick={() => onWhatsAppRestart?.(item)}
                                className="h-9 px-3 rounded-xl border border-border bg-background/50 hover:bg-background text-foreground transition-colors text-xs inline-flex items-center gap-1.5"
                                title="Reiniciar instância"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reiniciar
                              </button>
                              <button
                                type="button"
                                onClick={() => onWhatsAppDisconnect?.(item)}
                                className="h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors text-xs inline-flex items-center gap-1.5 ml-auto"
                                title="Desconectar este número"
                              >
                                <Unplug className="w-3.5 h-3.5" />
                                Desconectar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.useOfficialApi
                                ? "Conecte usando o Embedded Signup da Meta para usar a API oficial com o painel Omnichannel."
                                : "Clique para gerar o QR Code da conexão padrão via MonarcaHub e leia com o seu WhatsApp."}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              {!item.useOfficialApi ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenWhatsAppConnectUnofficial?.(item)}
                                  className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-semibold inline-flex items-center gap-2"
                                >
                                  Conectar via QR Code
                                  <RefreshCw className="w-3.5 h-3.5 opacity-80" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenWhatsAppConnectOfficial?.({
                                        mode: "whatsapp",
                                        branchId: item.type === "branch" ? item.branchId : null,
                                        phone: item.phone,
                                      })
                                    }
                                    className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-semibold inline-flex items-center gap-2"
                                  >
                                    Conectar via Meta
                                    <Globe className="w-3.5 h-3.5 opacity-80" />
                                  </button>
                                  {instagramUnlocked && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenWhatsAppConnectOfficial?.({
                                          mode: "both",
                                          branchId: item.type === "branch" ? item.branchId : null,
                                          phone: item.phone,
                                        })
                                      }
                                      className="h-10 px-4 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors text-xs font-medium inline-flex items-center gap-2"
                                      title="Conectar WhatsApp + Instagram juntos"
                                    >
                                      Conectar WhatsApp + Instagram
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </section>

      {/* Modal: já conectado ao clicar em conectar de novo */}
      {showAlreadyConnected && (
        <div
          onClick={() => setShowAlreadyConnected(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-2xl"
          >
            <h2 className="text-2xl font-semibold mb-3 text-foreground">Parece que você já está conectado!</h2>
            <p className="text-muted-foreground mb-4">
              Você pode desconectar para vincular outro número, ou reiniciar a conexão.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAlreadyConnected(false);
                  onWhatsAppDisconnect?.();
                }}
                disabled={!onWhatsAppDisconnect}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Desconectar
              </button>
              {onWhatsAppRestart && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAlreadyConnected(false);
                    onWhatsAppRestart?.();
                  }}
                  disabled={!onWhatsAppRestart}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Reiniciar
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAlreadyConnected(false)}
              className="mt-4 w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {isConciergeIntroOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsConciergeIntroOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-foreground">Conexão via concierge</h3>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Para autoações e agendamento de posts em seu Instagram, utilizamos o modelo "concierge", que é
                um serviço excelente para garantir que a automação funcione perfeitamente para você, sem que precise
                lidar com a parte técnica e demorada.
              </p>
              <p>
                Tenha em mãos o login, senha e códigos reserva de autenticação do perfil do seu Instagram. Não se
                preocupe, seus dados estarão criptografados e prometemos não vazar seus dados.
              </p>
              <p>Clique em confirmar para afirmar que entendeu e vamos para os próximos passos.</p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConciergeIntroOpen(false)}
                className="h-10 px-4 rounded-full border border-border text-foreground hover:bg-accent transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmConciergeIntro}
                className="h-10 px-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Confirmar e aceitar
              </button>
            </div>
          </div>
        </div>
      )}

      {isConciergeFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeConciergeForm}
        >
          <form
            onSubmit={submitConciergeOnboarding}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeConciergeForm}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.12em] text-primary font-semibold">Conexão via concierge</p>
              <h3 className="mt-2 text-3xl font-semibold text-foreground">Entrar no Instagram</h3>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={conciergeForm.instagramLogin}
                onChange={(event) => handleConciergeInputChange("instagramLogin", event.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background/70 text-foreground placeholder:text-muted-foreground"
                placeholder="Login ou email do Instagram"
                autoComplete="username"
                required
              />
              <input
                type="password"
                value={conciergeForm.instagramPassword}
                onChange={(event) => handleConciergeInputChange("instagramPassword", event.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background/70 text-foreground placeholder:text-muted-foreground"
                placeholder="Senha"
                autoComplete="current-password"
                required
              />
              <input
                type="text"
                value={conciergeForm.backupCode}
                onChange={(event) => handleConciergeInputChange("backupCode", event.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background/70 text-foreground placeholder:text-muted-foreground"
                placeholder="Código reserva de autenticação"
                required
              />
            </div>

            {conciergeError && <p className="mt-3 text-sm text-red-400">{conciergeError}</p>}
            {conciergeSuccess && <p className="mt-3 text-sm text-success">{conciergeSuccess}</p>}

            <button
              type="submit"
              disabled={isConciergeSubmitting}
              className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {isConciergeSubmitting ? "Enviando..." : "Entrar"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
