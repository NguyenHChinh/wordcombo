import { supabase } from '../supabase';

export async function logEvent(event, metadata = {}) {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const device_type = isMobile ? 'mobile' : 'desktop';
  await supabase
    .from('analytics')
    .insert([{ event, device_type, metadata }]);
}