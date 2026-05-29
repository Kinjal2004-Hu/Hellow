import { useEffect, useRef } from "react";
import { useQueries, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as chatService from "@/services/chat";
import { useChatStore } from "@/store/useChatStore";
import { useUIStore } from "@/store/useUIStore";

export function useRoomsQuery() {
  return useQuery({
    queryKey: ["chat", "rooms"],
    queryFn: async () => {
      const { rooms } = await chatService.fetchRooms();
      return rooms;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export function useMessagesQuery(roomId: string | null) {
  return useQuery({
    queryKey: ["chat", "messages", roomId],
    queryFn: async () => {
      const { messages } = await chatService.fetchMessages(roomId!);
      return messages;
    },
    enabled: !!roomId,
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  });
}

export function useMembersQuery(roomId: string | null) {
  return useQuery({
    queryKey: ["chat", "members", roomId],
    queryFn: async () => {
      const { members } = await chatService.fetchMembers(roomId!);
      return members;
    },
    enabled: !!roomId,
    staleTime: 60_000,
  });
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient();
  const addRoom = useChatStore((s) => s.addRoom);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (payload: { name: string; kind?: string; category?: string }) =>
      chatService.createRoom(payload),
    onSuccess: (room) => {
      addRoom(room);
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
      showToast("Room created", "success");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? "Failed to create room", "error");
    },
  });
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const removeRoom = useChatStore((s) => s.removeRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (roomId: string) => chatService.deleteRoom(roomId),
    onSuccess: (_data, roomId) => {
      removeRoom(roomId);
      setActiveRoom(null);
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
      showToast("Room deleted", "success");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? "Failed to delete room", "error");
    },
  });
}

export function useInviteMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ roomId, email }: { roomId: string; email: string }) =>
      chatService.inviteToRoom(roomId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "members"] });
      showToast("User invited", "success");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? "Invite failed", "error");
    },
  });
}

export function useKickMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
      chatService.kickMember(roomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "members"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
      showToast("Member removed", "success");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? "Failed to kick member", "error");
    },
  });
}

export function usePromoteMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
      chatService.promoteMember(roomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "members"] });
      showToast("Member promoted", "success");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? "Promotion failed", "error");
    },
  });
}

export function useSearchUsers() {
  return useMutation({
    mutationFn: (q: string) => chatService.searchUsers(q),
  });
}
