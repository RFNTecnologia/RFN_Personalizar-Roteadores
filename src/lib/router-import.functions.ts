import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const row = z.record(z.string(), z.unknown());
const payloadSchema = z.object({
  customers: z.array(row).default([]),
  equipment_profiles: z.array(row).default([]),
  equipment: z.array(row).default([]),
  work_orders: z.array(row).default([]),
  evidences: z.array(row).default([]),
  provider_settings: z.union([row, z.array(row)]).optional(),
});

type OldRow = Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
const oldId = (value: unknown) => value == null ? null : String(value);
const date = (value: unknown) => {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
};
const object = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value : {};

export const importRouterData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => payloadSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const result = { customers: 0, profiles: 0, equipment: 0, workOrders: 0, evidences: 0, settings: 0 };

    const upsert = async (table: "customers" | "equipment_profiles" | "equipment" | "work_orders" | "evidences", values: Record<string, unknown>) => {
      const { data: saved, error } = await supabase.from(table).upsert(values as never, { onConflict: "user_id,legacy_id" }).select("id").single();
      if (error) throw new Error(error.message);
      return saved.id;
    };

    const customerIds = new Map<string, string>();
    for (const item of data.customers) {
      const legacy = oldId(item['id']);
      if (!legacy || !text(item['name'])) continue;
      const id = await upsert("customers", { user_id: userId, legacy_id: legacy, name: text(item['name']), document: text(item['document']), phone: text(item['phone']), address: text(item['address']), created_at: date(item['created_at']) });
      customerIds.set(legacy, id); result.customers += 1;
    }

    const profileIds = new Map<string, string>();
    for (const item of data.equipment_profiles) {
      const legacy = oldId(item['id']);
      if (!legacy || !text(item['name'])) continue;
      const id = await upsert("equipment_profiles", { user_id: userId, legacy_id: legacy, name: text(item['name']), description: text(item['description']), config: object(item['config']), created_at: date(item['created_at']) });
      profileIds.set(legacy, id); result.profiles += 1;
    }

    const equipmentIds = new Map<string, string>();
    for (const item of data.equipment) {
      const legacy = oldId(item['id']);
      const serial = text(item['serial_number']);
      const manufacturer = text(item['manufacturer']);
      const model = text(item['model']);
      if (!legacy || !serial || !manufacturer || !model) continue;
      const status = ["pending", "preparing", "ready", "online", "offline", "unknown"].includes(String(item['status'])) ? String(item['status']) : "unknown";
      const id = await upsert("equipment", { user_id: userId, legacy_id: legacy, customer_id: customerIds.get(String(item['customer_id'])) ?? null, profile_id: profileIds.get(String(item['profile_id'])) ?? null, acs_device_id: text(item['acs_device_id']), manufacturer, model, equipment_type: text(item['equipment_type']) ?? "router", serial_number: serial, mac: text(item['mac']), status, last_seen: date(item['last_seen']), created_at: date(item['created_at']) });
      equipmentIds.set(legacy, id); result.equipment += 1;
    }

    const workOrderIds = new Map<string, string>();
    for (const item of data.work_orders) {
      const legacy = oldId(item['id']);
      if (!legacy) continue;
      const oldStatus = String(item['status'] ?? "open");
      const status = oldStatus === "open" ? "pending" : ["pending", "scheduled", "in_progress", "completed", "cancelled"].includes(oldStatus) ? oldStatus : "pending";
      const id = await upsert("work_orders", { user_id: userId, legacy_id: legacy, customer_id: customerIds.get(String(item['customer_id'])) ?? null, equipment_id: equipmentIds.get(String(item['equipment_id'])) ?? null, title: text(item['title']), status, notes: text(item['notes']), created_at: date(item['created_at']) });
      workOrderIds.set(legacy, id); result.workOrders += 1;
    }

    for (const item of data.evidences) {
      const legacy = oldId(item['id']);
      const filePath = text(item['file_path']);
      const kind = text(item['kind']);
      if (!legacy || !filePath || !kind) continue;
      await upsert("evidences", { user_id: userId, legacy_id: legacy, work_order_id: workOrderIds.get(String(item['work_order_id'])) ?? null, kind, file_path: filePath, created_at: date(item['created_at']) });
      result.evidences += 1;
    }

    const settings = Array.isArray(data.provider_settings) ? data.provider_settings[0] : data.provider_settings;
    if (settings) {
      const { error } = await supabase.from("provider_settings").upsert({ user_id: userId, company_name: text(settings['company_name']), logo_url: text(settings['logo_url']), favicon_url: text(settings['favicon_url']), support_phone: text(settings['support_phone']), support_whatsapp: text(settings['support_whatsapp']), portal_title: text(settings['portal_title']), portal_message: text(settings['portal_message']), default_wifi_ssid: text(settings['default_wifi_ssid']), default_wifi_ssid_5g: text(settings['default_wifi_ssid_5g']), acs_url: text(settings['acs_url']), acs_username: text(settings['acs_username']), connection_request_path: text(settings['connection_request_path']), reset_policy: text(settings['reset_policy']) }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
      result.settings = 1;
    }
    return result;
  });
