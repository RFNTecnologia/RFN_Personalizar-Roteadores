import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import {
  AcsPanel, ConsoleShell, DashboardPanel, DeviceDialog, EquipmentDialog,
  EquipmentPanel, IspPanel, ProfileDialog, ProfilesPanel,
  type ConsoleTab, type Customer, type Equipment, type EquipmentForm,
  type Profile, type Settings, type SettingsForm,
} from "@/components/router-console";
import { supabase } from "@/integrations/supabase/client";
import { importRouterData } from "@/lib/router-import.functions";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Central de Equipamentos — Personalização ISP" },
    { name: "description", content: "Cadastro, perfis e provisionamento seguro de roteadores, ONU e ONT." },
    { property: "og:title", content: "Central de Equipamentos — Personalização ISP" },
    { property: "og:description", content: "Cadastro, perfis e provisionamento seguro de roteadores, ONU e ONT." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

const allowedKeys = ["customers", "equipment_profiles", "equipment", "work_orders", "evidences", "provider_settings"];

function Index() {
  const navigate = useNavigate();
  const importData = useServerFn(importRouterData);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<ConsoleTab>("dashboard");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [importing, setImporting] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const load = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { await navigate({ to: "/auth" }); return; }
    setEmail(sessionData.session.user.email ?? "Conta ativa");
    const [equipmentResult, customerResult, profileResult, settingsResult] = await Promise.all([
      supabase.from("equipment").select("*, customers(name), equipment_profiles(name)").order("created_at", { ascending: false }),
      supabase.from("customers").select("*").order("name"),
      supabase.from("equipment_profiles").select("*").order("name"),
      supabase.from("provider_settings").select("*").maybeSingle(),
    ]);
    setEquipment((equipmentResult.data ?? []) as Equipment[]);
    setCustomers(customerResult.data ?? []);
    setProfiles(profileResult.data ?? []);
    setSettings(settingsResult.data);
    const error = equipmentResult.error ?? customerResult.error ?? profileResult.error ?? settingsResult.error;
    if (error) setNotice(`Não foi possível carregar os dados: ${error.message}`);
    setLoading(false);
  }, [navigate]);

  useEffect(() => { void load(); }, [load]);

  async function userId() { const { data } = await supabase.auth.getUser(); return data.user?.id; }
  async function signOut() { await supabase.auth.signOut(); await navigate({ to: "/auth" }); }
  async function addEquipment(form: EquipmentForm) {
    const id = await userId(); if (!id) return;
    const { error } = await supabase.from("equipment").insert({ user_id:id, manufacturer:form.manufacturer, model:form.model, equipment_type:form.equipment_type, serial_number:form.serial_number, mac:form.mac||null, customer_id:form.customer_id||null, profile_id:form.profile_id||null, status:"pending" });
    if (error) { setNotice(error.message); return; } setNotice("Equipamento salvo."); await load();
  }
  async function saveProfile(form:{name:string;description:string;config:string}, id?:string) {
    let config: unknown; try { config=JSON.parse(form.config); } catch { setNotice("A configuração do perfil não é um JSON válido."); return false; }
    const uid=await userId(); if(!uid)return false;
    const query=id?supabase.from("equipment_profiles").update({name:form.name,description:form.description||null,config:config as never}).eq("id",id):supabase.from("equipment_profiles").insert({user_id:uid,name:form.name,description:form.description||null,config:config as never});
    const {error}=await query;if(error){setNotice(error.message);return false;}setNotice("Perfil salvo.");await load();return true;
  }
  async function saveSettings(form:SettingsForm) {
    const uid=await userId();if(!uid)return;const empty=(v:string)=>v||null;
    const {error}=await supabase.from("provider_settings").upsert({user_id:uid,company_name:empty(form.company_name),logo_url:empty(form.logo_url),support_phone:empty(form.support_phone),support_whatsapp:empty(form.support_whatsapp),portal_title:empty(form.portal_title),portal_message:empty(form.portal_message),default_wifi_ssid:empty(form.default_wifi_ssid),default_wifi_ssid_5g:empty(form.default_wifi_ssid_5g),acs_url:empty(form.acs_url),acs_username:empty(form.acs_username),connection_request_path:empty(form.connection_request_path),reset_policy:empty(form.reset_policy)},{onConflict:"user_id"});
    if(error){setNotice(error.message);return;}setNotice("Personalização ISP salva.");await load();
  }
  async function assignProfile(equipmentId:string,profileId:string){const {error}=await supabase.from("equipment").update({profile_id:profileId||null}).eq("id",equipmentId);if(error){setNotice(error.message);return;}setNotice("Perfil associado ao equipamento.");setSelectedEquipment(null);await load();}
  async function handleImport(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file)return;setImporting(true);setNotice("");try{const parsed:unknown=JSON.parse(await file.text());if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)||!allowedKeys.some(key=>key in parsed))throw new Error("O arquivo não contém os dados esperados do programa antigo.");const result=await importData({data:parsed as never});setNotice(`Importação concluída: ${result.customers} clientes, ${result.equipment} equipamentos e ${result.profiles} perfis.`);await load();}catch(error){setNotice(error instanceof Error?error.message:"Não foi possível importar o arquivo.");}finally{setImporting(false);event.target.value="";}}
  function notify(message:string){setNotice(message);}

  if(loading)return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Carregando central...</main>;
  return <ConsoleShell tab={tab} setTab={setTab} email={email} onSignOut={signOut} onImport={handleImport} importing={importing} onNewEquipment={()=>setEquipmentOpen(true)} onNewProfile={()=>{setEditingProfile(null);setProfileOpen(true)}}>
    {notice&&<div role="status" className="mb-4 flex items-start justify-between gap-4 rounded-md border border-border bg-panel-raised p-4 text-sm"><span>{notice}</span><button aria-label="Fechar aviso" onClick={()=>setNotice("")} className="font-bold text-muted-foreground">×</button></div>}
    {tab==="dashboard"&&<DashboardPanel equipment={equipment} profiles={profiles} customers={customers} setTab={setTab}/>} 
    {tab==="equipment"&&<EquipmentPanel items={equipment} search={search} setSearch={setSearch} onOpen={setSelectedEquipment}/>} 
    {tab==="profiles"&&<ProfilesPanel profiles={profiles} onEdit={profile=>{setEditingProfile(profile);setProfileOpen(true)}}/>}
    {tab==="isp"&&<IspPanel key={settings?.updated_at??"new"} settings={settings} onSave={saveSettings}/>} 
    {tab==="acs"&&<AcsPanel onNotify={notify}/>} 
    <EquipmentDialog open={equipmentOpen} setOpen={setEquipmentOpen} profiles={profiles} customers={customers} onSave={addEquipment}/>
    <ProfileDialog open={profileOpen} setOpen={setProfileOpen} profile={editingProfile} onSave={saveProfile}/>
    <DeviceDialog item={selectedEquipment} setItem={setSelectedEquipment} profiles={profiles} onAssign={assignProfile} onNotify={notify}/>
  </ConsoleShell>;
}