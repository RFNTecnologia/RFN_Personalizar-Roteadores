import {
  Activity, Antenna, Check, ChevronRight, CircleDot, FileJson, FileUp,
  LogOut, Plus, RefreshCw, Router, Search, Settings2, ShieldCheck, Wifi, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";

export type Equipment = Tables<"equipment"> & { customers: { name: string } | null; equipment_profiles: { name: string } | null };
export type Customer = Tables<"customers">;
export type Profile = Tables<"equipment_profiles">;
export type Settings = Tables<"provider_settings">;
export type ConsoleTab = "dashboard" | "equipment" | "profiles" | "isp" | "acs";

const tabs: Array<{ id: ConsoleTab; label: string }> = [
  { id: "dashboard", label: "Dashboard" }, { id: "equipment", label: "Equipamentos" },
  { id: "profiles", label: "Perfis" }, { id: "isp", label: "Personalização ISP" }, { id: "acs", label: "GenieACS" },
];

export function ConsoleShell({ tab, setTab, email, onSignOut, onImport, importing, onNewEquipment, onNewProfile, children }: {
  tab: ConsoleTab; setTab: (tab: ConsoleTab) => void; email: string; onSignOut: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void; importing: boolean;
  onNewEquipment: () => void; onNewProfile: () => void; children: ReactNode;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-header/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Router size={21}/></div><div className="min-w-0"><p className="truncate text-lg font-extrabold">LOGO DO SEU PROVEDOR</p><p className="truncate text-xs text-muted-foreground">Personalização de Roteadores • ONU • ONT</p></div></div>
        <div className="flex items-center gap-2"><span className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-warning"/>ACS: indisponível</span><Button size="icon" variant="ghost" aria-label="Sair" title={`Sair de ${email}`} onClick={onSignOut}><LogOut/></Button></div>
      </div>
    </header>
    <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h1 className="text-2xl font-extrabold sm:text-3xl">Central de Equipamentos</h1><p className="mt-1 text-sm text-muted-foreground">Cadastro, perfis e provisionamento via GenieACS</p></div><div className="flex flex-wrap gap-2"><input ref={uploadRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport}/><Button onClick={() => uploadRef.current?.click()} disabled={importing}><FileUp/>{importing ? "Importando..." : "Importar dados"}</Button><Button variant="secondary" onClick={onNewEquipment}><Plus/>Equipamento</Button><Button variant="secondary" onClick={onNewProfile}><Plus/>Perfil</Button></div></div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border" aria-label="Áreas do sistema">{tabs.map((item) => <Button key={item.id} variant="ghost" onClick={() => setTab(item.id)} className={`h-11 shrink-0 rounded-b-none border-b-2 px-4 ${tab === item.id ? "border-primary bg-panel-raised text-foreground" : "border-transparent text-muted-foreground"}`}>{item.label}</Button>)}</nav>
      {children}
    </main>
  </div>;
}

export function DashboardPanel({ equipment, profiles, customers, setTab }: { equipment: Equipment[]; profiles: Profile[]; customers: Customer[]; setTab:(tab:ConsoleTab)=>void }) {
  const online = equipment.filter((item) => item.status === "online").length;
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<Router/>} label="Equipamentos" value={equipment.length}/><Metric icon={<Wifi/>} label="Online" value={online} success/><Metric icon={<FileJson/>} label="Perfis" value={profiles.length}/><Metric icon={<Activity/>} label="Clientes" value={customers.length}/></div><section className="rounded-lg border border-border bg-card p-5 sm:p-6"><div className="flex items-start gap-4"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/15 text-primary"><ChevronRight/></div><div><h2 className="text-lg font-bold">Próxima etapa</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Cadastre um CPE ou sincronize um equipamento que já tenha feito Inform no GenieACS. Depois, abra o equipamento e associe um perfil. Os parâmetros TR-069 reais devem ser coletados do firmware antes do envio.</p><Button className="mt-4" variant="secondary" onClick={() => setTab("equipment")}>Ver equipamentos</Button></div></div></section></div>;
}

function Metric({ icon, label, value, success=false }: { icon:ReactNode; label:string; value:number; success?:boolean }) { return <div className="rounded-lg border border-border bg-card p-5"><div className={`mb-4 grid size-9 place-items-center rounded-md ${success ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>{icon}</div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-extrabold">{value}</p></div>; }

export function EquipmentPanel({ items, search, setSearch, onOpen }: { items:Equipment[]; search:string; setSearch:(v:string)=>void; onOpen:(item:Equipment)=>void }) {
  const visible = useMemo(() => items.filter((x) => [x.manufacturer,x.model,x.serial_number,x.mac,x.customers?.name,x.equipment_profiles?.name].join(" ").toLowerCase().includes(search.toLowerCase())), [items,search]);
  return <section><SearchBar value={search} onChange={setSearch}/><div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr>{["Fabricante","Modelo","Tipo","Serial","MAC","Cliente","Perfil","Status","Ações"].map(x=><th key={x} className="px-4 py-3 font-bold">{x}</th>)}</tr></thead><tbody className="divide-y divide-border">{visible.map((x)=><tr key={x.id} className="hover:bg-panel-raised/60"><td className="px-4 py-3 font-semibold">{x.manufacturer}</td><td className="px-4 py-3">{x.model}</td><td className="px-4 py-3 text-muted-foreground">{x.equipment_type}</td><td className="px-4 py-3 font-mono text-xs">{x.serial_number}</td><td className="px-4 py-3 font-mono text-xs">{x.mac || "—"}</td><td className="px-4 py-3">{x.customers?.name || "—"}</td><td className="px-4 py-3">{x.equipment_profiles?.name || "Sem perfil"}</td><td className="px-4 py-3"><StatusBadge status={x.status}/></td><td className="px-4 py-3"><Button size="sm" variant="secondary" onClick={()=>onOpen(x)}>Abrir</Button></td></tr>)}{!visible.length&&<tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Nenhum equipamento cadastrado.</td></tr>}</tbody></table></div></section>;
}

export function ProfilesPanel({ profiles, onEdit }: { profiles:Profile[]; onEdit:(profile:Profile)=>void }) { return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{profiles.map((p)=>{ const config = p.config && typeof p.config === "object" && !Array.isArray(p.config) ? p.config as Record<string,unknown> : {}; const values = Array.isArray(config['parameterValues']) ? config['parameterValues'] : []; return <article key={p.id} className="rounded-lg border border-border bg-card p-5"><div className="flex items-start justify-between gap-3"><div className="grid size-9 place-items-center rounded-md bg-primary/15 text-primary"><Settings2/></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{values.length} parâmetros</span></div><h2 className="mt-5 text-lg font-bold">{p.name}</h2><p className="mt-1 min-h-10 text-sm text-muted-foreground">{p.description || "Sem descrição"}</p><pre className="mt-4 max-h-40 overflow-auto rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">{JSON.stringify(config,null,2)}</pre><Button className="mt-4" onClick={()=>onEdit(p)}>Editar perfil</Button></article>;})}{!profiles.length&&<Empty icon={<FileJson/>} text="Nenhum perfil cadastrado."/>}</div>; }

export function IspPanel({ settings, onSave }: { settings:Settings|null; onSave:(value:SettingsForm)=>Promise<void> }) {
  const [form,setForm] = useState<SettingsForm>(()=>settingsToForm(settings)); const [saving,setSaving]=useState(false);
  const field=(key:keyof SettingsForm,value:string)=>setForm(prev=>({...prev,[key]:value}));
  async function submit(e:FormEvent){e.preventDefault();setSaving(true);await onSave(form);setSaving(false);}
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><form onSubmit={submit} className="rounded-lg border border-border bg-card p-5 sm:p-6"><h2 className="text-xl font-bold">Personalização ISP</h2><p className="mt-1 text-sm text-muted-foreground">Identidade visual e dados de bootstrap da sua empresa.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><FormField label="Nome da empresa"><Input required value={form.company_name} onChange={e=>field("company_name",e.target.value)}/></FormField><FormField label="Título da tela do cliente"><Input value={form.portal_title} onChange={e=>field("portal_title",e.target.value)}/></FormField><FormField className="sm:col-span-2" label="Logo (URL pública)"><Input type="url" value={form.logo_url} onChange={e=>field("logo_url",e.target.value)} placeholder="https://.../logo.png"/></FormField><FormField label="Telefone de suporte"><Input value={form.support_phone} onChange={e=>field("support_phone",e.target.value)}/></FormField><FormField label="WhatsApp"><Input value={form.support_whatsapp} onChange={e=>field("support_whatsapp",e.target.value)}/></FormField><FormField className="sm:col-span-2" label="Mensagem da tela do cliente"><Textarea value={form.portal_message} onChange={e=>field("portal_message",e.target.value)}/></FormField><SectionLabel>Padrão Wi-Fi do provedor</SectionLabel><FormField label="SSID padrão 2.4 GHz"><Input value={form.default_wifi_ssid} onChange={e=>field("default_wifi_ssid",e.target.value)}/></FormField><FormField label="SSID padrão 5 GHz"><Input value={form.default_wifi_ssid_5g} onChange={e=>field("default_wifi_ssid_5g",e.target.value)}/></FormField><SectionLabel>Bootstrap ACS</SectionLabel><FormField label="ACS URL"><Input value={form.acs_url} onChange={e=>field("acs_url",e.target.value)} placeholder="https://acs.seudominio.com"/></FormField><FormField label="ACS Username"><Input value={form.acs_username} onChange={e=>field("acs_username",e.target.value)}/></FormField><FormField className="sm:col-span-2" label="Connection Request Path"><Input value={form.connection_request_path} onChange={e=>field("connection_request_path",e.target.value)} placeholder="/tr069"/></FormField><SectionLabel>Política pós-reset</SectionLabel><FormField className="sm:col-span-2" label="Observação técnica"><Textarea value={form.reset_policy} onChange={e=>field("reset_policy",e.target.value)}/></FormField></div><Button className="mt-6" disabled={saving}><Check/>{saving?"Salvando...":"Salvar Personalização ISP"}</Button></form><aside className="h-fit rounded-lg border border-border bg-card p-5"><h3 className="font-bold">Pré-visualização</h3><div className="mt-4 rounded-lg border border-border bg-background p-5">{form.logo_url&&<img src={form.logo_url} alt="Logo do provedor" className="mb-4 max-h-16 max-w-[180px] object-contain"/>}<p className="text-xl font-extrabold">{form.company_name||"Sua Empresa"}</p><p className="mt-1 text-sm text-muted-foreground">{form.portal_title||"Configuração do Equipamento"}</p><div className="mt-4 rounded-md bg-panel-raised p-3 text-sm text-muted-foreground">{form.portal_message||"Este equipamento é gerenciado pelo provedor."}</div><KeyValue label="SSID 2.4 GHz" value={form.default_wifi_ssid||"—"}/><KeyValue label="SSID 5 GHz" value={form.default_wifi_ssid_5g||"—"}/></div><p className="mt-3 text-xs leading-5 text-muted-foreground">A pré-visualização representa a identidade usada na plataforma. Ela não altera o firmware.</p></aside></div>;
}

export type SettingsForm = { company_name:string;logo_url:string;support_phone:string;support_whatsapp:string;portal_title:string;portal_message:string;default_wifi_ssid:string;default_wifi_ssid_5g:string;acs_url:string;acs_username:string;connection_request_path:string;reset_policy:string };
function settingsToForm(s:Settings|null):SettingsForm{return{company_name:s?.company_name??"",logo_url:s?.logo_url??"",support_phone:s?.support_phone??"",support_whatsapp:s?.support_whatsapp??"",portal_title:s?.portal_title??"",portal_message:s?.portal_message??"",default_wifi_ssid:s?.default_wifi_ssid??"",default_wifi_ssid_5g:s?.default_wifi_ssid_5g??"",acs_url:s?.acs_url??"",acs_username:s?.acs_username??"",connection_request_path:s?.connection_request_path??"",reset_policy:s?.reset_policy??""};}

export type GenieDevice = {
  _id: string;
  _tags?: string[];
  DeviceId?: {
    Manufacturer?: string;
    OUI?: string;
    ProductClass?: string;
    SerialNumber?: string;
  };
  HardwareVersion?: string;
  SoftwareVersion?: string;
  LastInform?: string;
  ProvisioningCode?: string;
  Status?: string;
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return iso; }
}

export function AcsPanel({ onNotify }:{onNotify:(message:string)=>void}) {
  const [devices, setDevices] = useState<GenieDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("https://uwrhzwhhjxwgfqtmhrpb.supabase.co/functions/v1/genieacs-proxy", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(Array.isArray(data) ? data : (data.items ?? []));
        setConnected(true);
      } else {
        setConnected(false);
        onNotify("Não foi possível conectar ao GenieACS. Verifique se o serviço está acessível.");
      }
    } catch {
      setConnected(false);
      onNotify("Erro de conexão com o GenieACS.");
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => { void fetchDevices(); }, [fetchDevices]);

  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Metric icon={<Antenna/>} label="Dispositivos no GenieACS" value={devices.length}/><div className="rounded-lg border border-border bg-card p-5"><div className="flex items-center gap-3"><div className={`grid size-9 place-items-center rounded-md ${connected ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}><CircleDot/></div><div><p className="text-xs font-semibold uppercase text-muted-foreground">Conexão</p><p className="mt-1 font-bold">{connected ? "Conectado ao GenieACS" : "GenieACS offline"}</p></div></div></div></div><div className="overflow-x-auto rounded-lg border border-border bg-card"><div className="flex items-center justify-between gap-3 border-b border-border p-4"><h2 className="font-bold">Dispositivos GenieACS</h2><Button disabled={loading} onClick={()=>void fetchDevices()}><RefreshCw className={loading ? "animate-spin" : ""}/>{loading ? "Sincronizando..." : "Sincronizar ACS"}</Button></div><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase text-muted-foreground"><tr>{["ID GenieACS","Fabricante","Modelo","Serial","Último Inform","Ação"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{devices.length ? devices.map((d)=>{ const devId = d.DeviceId || {}; return <tr key={d._id} className="hover:bg-panel-raised/60"><td className="px-4 py-3 font-mono text-xs">{d._id}</td><td className="px-4 py-3">{devId.Manufacturer || devId.OUI || "—"}</td><td className="px-4 py-3">{devId.ProductClass || "—"}</td><td className="px-4 py-3 font-mono text-xs">{devId.SerialNumber || "—"}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(d.LastInform)}</td><td className="px-4 py-3"><Button size="sm" variant="secondary" onClick={()=>onNotify(`Vinculação de CPE: abra o equipamento e informe o ID GenieACS ${d._id}`)}>Vincular</Button></td></tr>;}) : <tr><td colSpan={6} className="p-10 text-center text-muted-foreground"><ShieldCheck className="mx-auto mb-3"/>Nenhum CPE encontrado no GenieACS.</td></tr>}</tbody></table></div></div>;
}

export function EquipmentDialog({ open, setOpen, profiles, customers, onSave }:{open:boolean;setOpen:(v:boolean)=>void;profiles:Profile[];customers:Customer[];onSave:(value:EquipmentForm)=>Promise<void>}) { const initial={manufacturer:"",model:"",equipment_type:"router",serial_number:"",mac:"",profile_id:"",customer_id:""};const [form,setForm]=useState<EquipmentForm>(initial);const [busy,setBusy]=useState(false);async function submit(e:FormEvent){e.preventDefault();setBusy(true);await onSave(form);setBusy(false);setForm(initial);setOpen(false)}return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Novo equipamento</DialogTitle><DialogDescription>Cadastre os dados de identificação do CPE.</DialogDescription></DialogHeader><form onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><FormField label="Fabricante"><Input required value={form.manufacturer} onChange={e=>setForm({...form,manufacturer:e.target.value})}/></FormField><FormField label="Modelo"><Input required value={form.model} onChange={e=>setForm({...form,model:e.target.value})}/></FormField><FormField label="Tipo"><NativeSelect value={form.equipment_type} onChange={v=>setForm({...form,equipment_type:v})} options={[["router","Router"],["onu","ONU"],["ont","ONT"]]}/></FormField><FormField label="Serial"><Input required value={form.serial_number} onChange={e=>setForm({...form,serial_number:e.target.value})}/></FormField><FormField label="MAC"><Input value={form.mac} onChange={e=>setForm({...form,mac:e.target.value})}/></FormField><FormField label="Cliente"><NativeSelect value={form.customer_id} onChange={v=>setForm({...form,customer_id:v})} options={[["","Sem cliente"],...customers.map(c=>[c.id,c.name] as [string,string])]}/></FormField><FormField label="Perfil"><NativeSelect value={form.profile_id} onChange={v=>setForm({...form,profile_id:v})} options={[["","Sem perfil"],...profiles.map(p=>[p.id,p.name] as [string,string])]}/></FormField></div><DialogFooter className="mt-6"><Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={busy}>{busy?"Salvando...":"Salvar"}</Button></DialogFooter></form></DialogContent></Dialog> }
export type EquipmentForm={manufacturer:string;model:string;equipment_type:string;serial_number:string;mac:string;profile_id:string;customer_id:string};

export function ProfileDialog({ open,setOpen,profile,onSave }:{open:boolean;setOpen:(v:boolean)=>void;profile:Profile|null;onSave:(v:{name:string;description:string;config:string},id?:string)=>Promise<boolean>}) { const [name,setName]=useState("");const [description,setDescription]=useState("");const [config,setConfig]=useState("{\n  \"parameterValues\": []\n}");const [busy,setBusy]=useState(false);function sync(){setName(profile?.name??"");setDescription(profile?.description??"");setConfig(JSON.stringify(profile?.config??{parameterValues:[]},null,2));}async function submit(e:FormEvent){e.preventDefault();setBusy(true);const ok=await onSave({name,description,config},profile?.id);setBusy(false);if(ok)setOpen(false)}return <Dialog open={open} onOpenChange={(v)=>{setOpen(v);if(v)sync()}}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{profile?"Editar":"Novo"} perfil</DialogTitle><DialogDescription>Use somente parâmetros existentes no firmware.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><FormField label="Nome"><Input required value={name} onChange={e=>setName(e.target.value)}/></FormField><FormField label="Descrição"><Input value={description} onChange={e=>setDescription(e.target.value)}/></FormField><FormField label="Configuração JSON"><Textarea className="min-h-72 font-mono text-xs" value={config} onChange={e=>setConfig(e.target.value)}/></FormField><DialogFooter><Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Cancelar</Button><Button disabled={busy}>{busy?"Salvando...":"Salvar"}</Button></DialogFooter></form></DialogContent></Dialog> }

export function DeviceDialog({ item,setItem,profiles,onAssign,onNotify }:{item:Equipment|null;setItem:(v:Equipment|null)=>void;profiles:Profile[];onAssign:(equipmentId:string,profileId:string)=>Promise<void>;onNotify:(m:string)=>void}) { const [tab,setTab]=useState("info");const [profileId,setProfileId]=useState("");if(!item)return null;const profile=profiles.find(p=>p.id===item.profile_id);const config=profile?.config&&typeof profile.config==="object"&&!Array.isArray(profile.config)?profile.config as Record<string,unknown>:{};const values=Array.isArray(config['parameterValues'])?config['parameterValues']:[];return <Dialog open={Boolean(item)} onOpenChange={v=>{if(!v)setItem(null)}}><DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto"><DialogHeader><div className="flex items-start justify-between gap-4 pr-8"><div><DialogTitle>{item.manufacturer} {item.model}</DialogTitle><DialogDescription>Serial <span className="font-mono">{item.serial_number}</span> · ACS ID: <span className="font-mono">{item.acs_device_id||"não vinculado"}</span></DialogDescription></div><StatusBadge status={item.status}/></div></DialogHeader><div className="flex gap-1 overflow-x-auto border-b border-border">{["info","params","wifi","wan","tr069","provision"].map(x=><Button key={x} variant="ghost" size="sm" onClick={()=>setTab(x)} className={`rounded-b-none border-b-2 ${tab===x?"border-primary bg-panel-raised":"border-transparent"}`}>{({info:"Informações",params:"Parâmetros",wifi:"Wi-Fi",wan:"WAN",tr069:"TR-069",provision:"Provisionamento"} as Record<string,string>)[x]}</Button>)}</div>{tab==="info"?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Fabricante" value={item.manufacturer}/><Info label="Modelo" value={item.model}/><Info label="Serial" value={item.serial_number}/><Info label="MAC" value={item.mac||"—"}/></div>:tab==="provision"?<ProvisionPlaceholder onNotify={onNotify}/>:<ParameterView title={tab==="params"?"Todos os parâmetros":tab==="wifi"?"Wi-Fi / WLAN":tab==="wan"?"WAN / Internet / VLAN / IP":"Gerência TR-069 / ManagementServer"} values={values}/>}<div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[260px_1fr]"><FormField label="Perfil"><NativeSelect value={profileId||item.profile_id||""} onChange={setProfileId} options={[["","Sem perfil"],...profiles.map(p=>[p.id,p.name] as [string,string])]}/></FormField><div className="flex flex-wrap items-end gap-2"><Button onClick={()=>onAssign(item.id,profileId||item.profile_id||"")}>Associar perfil</Button><Button variant="secondary" disabled={!item.acs_device_id} onClick={()=>onNotify("A aplicação do perfil será liberada após conectar o GenieACS com segurança.")}>Aplicar perfil</Button><Button variant="secondary" disabled={!item.acs_device_id} onClick={()=>onNotify("A atualização será liberada após conectar o GenieACS com segurança.")}><RefreshCw/>Atualizar do CPE</Button></div></div></DialogContent></Dialog> }

function ParameterView({title,values}:{title:string;values:unknown[]}) { const [search,setSearch]=useState("");const rows=values.filter(v=>JSON.stringify(v).toLowerCase().includes(search.toLowerCase()));return <div className="rounded-lg border border-border bg-card p-4"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="font-bold">{title}</h3><p className="text-xs text-muted-foreground">{rows.length} parâmetro(s)</p></div><SearchBar value={search} onChange={setSearch}/></div>{rows.length?<div className="divide-y divide-border overflow-hidden rounded-md border border-border">{rows.map((v,i)=><div key={i} className="grid gap-2 bg-background p-3 text-xs sm:grid-cols-[1.6fr_1fr]"><code className="break-all text-muted-foreground">{Array.isArray(v)?String(v[0]):`Parâmetro ${i+1}`}</code><span className="break-all">{Array.isArray(v)?String(v[1]??"—"):JSON.stringify(v)}</span></div>)}</div>:<p className="rounded-md bg-background p-8 text-center text-sm text-muted-foreground">Nenhum parâmetro desta categoria foi coletado.</p>}</div> }
function ProvisionPlaceholder({onNotify}:{onNotify:(m:string)=>void}) { return <div className="rounded-lg border border-border bg-card p-5"><h3 className="font-bold">Provisionamento manual do CPE</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Os caminhos PPPoE, VLAN, MTU, DNS e Wi-Fi serão preenchidos após a coleta dos parâmetros reais do firmware MR60X.</p><Button className="mt-4" disabled onClick={()=>onNotify("")}>Enviar para o CPE</Button></div> }
function Info({label,value}:{label:string;value:string}){return <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 break-all font-bold">{value}</p></div>}
function SearchBar({value,onChange}:{value:string;onChange:(v:string)=>void}){return <label className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-card px-3 sm:w-80"><Search size={16} className="text-muted-foreground"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder="Pesquisar..." className="min-w-0 flex-1 bg-transparent text-sm outline-none"/>{value&&<Button type="button" size="icon" variant="ghost" className="size-7" onClick={()=>onChange("")} aria-label="Limpar pesquisa"><X/></Button>}</label>}
function StatusBadge({status}:{status:string}){const online=status==="online";return <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold ${online?"bg-success/15 text-success":"bg-muted text-muted-foreground"}`}>{online?"online":statusLabel(status)}</span>}
function statusLabel(status:string){return ({pending:"Pendente",preparing:"Em preparação",ready:"Pronto",offline:"Offline",unknown:"Desconhecido"} as Record<string,string>)[status]??status}
function FormField({label,children,className=""}:{label:string;children:ReactNode;className?:string}){return <label className={className}><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>}
function SectionLabel({children}:{children:ReactNode}){return <h3 className="mt-2 font-bold sm:col-span-2">{children}</h3>}
function NativeSelect({value,onChange,options}:{value:string;onChange:(v:string)=>void;options:[string,string][]}){return <select value={value} onChange={e=>onChange(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>}
function KeyValue({label,value}:{label:string;value:string}){return <div className="mt-4 flex justify-between gap-4 text-sm"><span className="text-muted-foreground">{label}</span><strong className="break-all text-right">{value}</strong></div>}
function Empty({icon,text}:{icon:ReactNode;text:string}){return <div className="col-span-full rounded-lg border border-border bg-card p-10 text-center text-muted-foreground"><div className="mx-auto mb-3 w-fit">{icon}</div><p className="text-sm">{text}</p></div>}