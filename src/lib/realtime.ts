/** Unique topic per subscribe(). supabase.channel(name) reuses topics; removeChannel is async. */
export const realtimeTopic = (prefix: string) =>
  `${prefix}:${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
