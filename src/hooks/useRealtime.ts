import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  enabled?: boolean;
}

export const useRealtime = ({ table, filter, enabled = true }: UseRealtimeOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}${filter ? `-${filter}` : ''}`;
    
    // Create realtime channel
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          setLastUpdate(new Date());
        }
      )
      .subscribe((status) => {
        console.log(`Realtime status for ${table}:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [table, filter, enabled]);

  const disconnect = () => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
      setIsConnected(false);
    }
  };

  return {
    isConnected,
    lastUpdate,
    disconnect
  };
};

// Specific hooks for common use cases
export const useRealtimeAssignments = (classId?: string) => {
  return useRealtime({
    table: 'assignments',
    filter: classId ? `class_id=eq.${classId}` : undefined,
    enabled: !!classId
  });
};

export const useRealtimeSubmissions = (studentId?: string) => {
  return useRealtime({
    table: 'submissions',
    filter: studentId ? `student_id=eq.${studentId}` : undefined,
    enabled: !!studentId
  });
};

export const useRealtimeLeaderboard = (classId?: string) => {
  return useRealtime({
    table: 'submissions',
    filter: classId ? `class_id=eq.${classId}` : undefined,
    enabled: !!classId
  });
};