import { supabase } from '../supabase';

const VISITOR_KEY = 'wordcombo-visitor-id';

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    // use crypto.randomUUID where available, otherwise fallback
    id = (crypto.randomUUID && crypto.randomUUID()) ||
         `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      localStorage.setItem(VISITOR_KEY, id);
    } catch (e) {
      console.warn('Failed to persist visitor ID', e);
    }
  }
  return id;
}

export async function logEvent(event, metadata = {}) {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const device_type = isMobile ? 'mobile' : 'desktop';
  const visitor_id = getVisitorId();

  await supabase
    .from('analytics')
    .insert([{ event, device_type, metadata, visitor_id }]);
}