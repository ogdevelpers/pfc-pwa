import { teams } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { phoneKey } from "@/lib/utils";

type GuestRow = { id?: unknown; name?: unknown; team_id?: unknown };

export async function POST(request: Request) {
  let raw = "";
  try {
    const body = (await request.json()) as { phone?: unknown };
    raw = typeof body.phone === "string" ? body.phone : "";
  } catch {
    raw = "";
  }

  const phone = phoneKey(raw);
  if (!phone) {
    return Response.json({ error: "Enter the mobile number from your invitation." }, { status: 400 });
  }
  if (!supabase) {
    return Response.json(
      { error: "The guest list is not connected. Add the Supabase keys and run the schema." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("find_guest_by_phone", { p_phone: phone });
  if (error) {
    return Response.json(
      { error: "That number could not be checked. Run supabase/schema.sql if this project is new." },
      { status: 502 },
    );
  }

  const row = (Array.isArray(data) ? data[0] : data) as GuestRow | undefined;
  const id = typeof row?.id === "string" ? row.id : "";
  const name = typeof row?.name === "string" ? row.name.trim() : "";
  const teamId = typeof row?.team_id === "string" ? row.team_id : "";
  if (!id || !name || !teams.some((team) => team.id === teamId)) {
    return Response.json({ error: "That number is not on the guest list." }, { status: 401 });
  }

  return Response.json({ id, name, teamId, phone });
}
