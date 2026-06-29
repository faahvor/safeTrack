import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import type { AppNotification } from '@/types';

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await notificationsApi.list();
      return data;
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: (_, id) => {
      qc.setQueryData<AppNotification[]>(['notifications'], (prev) =>
        prev?.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.setQueryData<AppNotification[]>(['notifications'], (prev) =>
        prev?.map((n) => ({ ...n, read: true }))
      );
    },
  });
}
