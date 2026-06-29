import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sosApi } from '@/services/api';
import { useSOSStore } from '@/store/sosStore';
import type { SOSEvent } from '@/types';

export function useSOSHistory() {
  return useQuery<SOSEvent[]>({
    queryKey: ['sos-history'],
    queryFn: async () => {
      const { data } = await sosApi.history();
      return data;
    },
  });
}

export function useTriggerSOS() {
  const qc = useQueryClient();
  const setActiveSOS = useSOSStore((s) => s.setActiveSOS);
  return useMutation({
    mutationFn: (data: { latitude: number; longitude: number; address?: string }) =>
      sosApi.trigger(data),
    onSuccess: ({ data }) => {
      setActiveSOS(data);
      qc.invalidateQueries({ queryKey: ['sos-history'] });
    },
  });
}

export function useResolveSOS() {
  const qc = useQueryClient();
  const setActiveSOS = useSOSStore((s) => s.setActiveSOS);
  return useMutation({
    mutationFn: (id: string) => sosApi.resolve(id),
    onSuccess: () => {
      setActiveSOS(null);
      qc.invalidateQueries({ queryKey: ['sos-history'] });
    },
  });
}
