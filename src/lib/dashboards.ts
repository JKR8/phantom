import { supabase } from './supabase';
import type { DashboardSnapshot, DbDashboard } from '../types';

function nanoid(len = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function saveDashboard(
  id: string | null,
  name: string,
  snapshot: DashboardSnapshot
): Promise<DbDashboard> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const row = {
    name,
    scenario: snapshot.scenario,
    items: snapshot.items as any,
    filters: snapshot.filters as any,
    layout_mode: snapshot.layoutMode,
    theme_palette: snapshot.themePalette,
  };

  if (id) {
    // Update existing
    const { data, error } = await supabase
      .from('dashboards')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as DbDashboard;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('dashboards')
      .insert({ ...row, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data as DbDashboard;
  }
}

export async function loadDashboard(id: string): Promise<DbDashboard> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as DbDashboard;
}

export async function loadSharedDashboard(shareId: string): Promise<DbDashboard> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single();
  if (error) throw error;
  return data as DbDashboard;
}

export async function listMyDashboards(): Promise<DbDashboard[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbDashboard[];
}

export async function deleteDashboard(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('dashboards')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function toggleShare(
  id: string,
  isPublic: boolean
): Promise<{ share_id: string | null }> {
  if (!supabase) throw new Error('Supabase not configured');

  const share_id = isPublic ? nanoid() : null;
  const { data, error } = await supabase
    .from('dashboards')
    .update({ is_public: isPublic, share_id })
    .eq('id', id)
    .select('share_id')
    .single();
  if (error) throw error;
  return { share_id: data?.share_id ?? null };
}
