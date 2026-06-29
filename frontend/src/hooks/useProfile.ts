import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

export function useProfile() {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await profileApi.get();
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (data: { name?: string; phone?: string; avatar?: string }) =>
      profileApi.update(data),
    onSuccess: ({ data }) => {
      qc.setQueryData(['profile'], data);
      updateUser(data);
    },
  });
}
