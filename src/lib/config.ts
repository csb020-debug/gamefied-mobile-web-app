// Environment configuration validation
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  isConfigured: () => {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  },
  validate: () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Config validation:', { 
      url: url, 
      key: key?.substring(0, 20) + '...',
      urlType: typeof url,
      keyType: typeof key
    });
    
    if (!url || url === 'undefined' || url === '') {
      console.error('VITE_SUPABASE_URL is not configured or is empty');
      return false;
    }
    
    if (!key || key === 'undefined' || key === '') {
      console.error('VITE_SUPABASE_ANON_KEY is not configured or is empty');
      return false;
    }
    
    if (!url.startsWith('https://')) {
      console.error('VITE_SUPABASE_URL must be a valid HTTPS URL');
      return false;
    }
    
    if (!key.startsWith('eyJ')) {
      console.error('VITE_SUPABASE_ANON_KEY must be a valid JWT token');
      return false;
    }
    
    return true;
  }
};

export default config;
