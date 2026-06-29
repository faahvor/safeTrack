import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sosPrivacyApi } from '@/services/api';
import type { SOSPrivacy } from '@/types';

export function useGetSOSPrivacy() {
  return useQuery<SOSPrivacy>({
    queryKey: ['sos-privacy'],
    queryFn: async () => {
      const { data } = await sosPrivacyApi.get();
      return data;
    },
  });
}

export function useUpdateSOSPrivacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SOSPrivacy>) => sosPrivacyApi.update(data),
    onSuccess: ({ data }) => qc.setQueryData(['sos-privacy'], data),
  });
}
