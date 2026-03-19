import { useCallback, useEffect, useMemo } from 'react';
import { useFriendSocket } from '@/shared/api/socket/FriendSocketProvider';
import { useFriendStore } from './friendStore';

export const useFriend = (searchKeyword: string = '') => {
  const { friendSocket: socket } = useFriendSocket();
  const {
    friends,
    recommendedFriends,
    searchResults,
    isLoading,
    initListeners,
    setSearchResults,
  } = useFriendStore();

  useEffect(() => {
    if (!socket) return;

    const setup = () => {
      initListeners(socket);

      socket.emit('friends:getList');
      socket.emit('friends:getRecommendedList');
    };

    if (socket.connected) {
      setup();
    } else {
      socket.once('connect', setup);
    }
  }, [socket, initListeners]);

  const requestFriend = useCallback(
    (targetUserId: number) => {
      if (!socket) return;
      socket.emit('friends:requestSend', { targetUserId });
    },
    [socket],
  );

  const handleFriendAction = useCallback(
    (
      targetUserId: number,
      action: 'ACCEPT' | 'BLOCK' | 'DELETE' | 'CANCEL' | 'REJECT' | 'UNBLOCK',
    ) => {
      if (!socket) return;

      const actionMap = {
        ACCEPT: {
          event: 'friends:requestAccept',
          data: { requesterId: targetUserId },
        },
        BLOCK: { event: 'friends:block', data: { targetUserId } },
        DELETE: { event: 'friends:delete', data: { targetUserId } },
        CANCEL: { event: 'friends:delete', data: { targetUserId } },
        REJECT: { event: 'friends:delete', data: { targetUserId } },
        UNBLOCK: { event: 'friends:delete', data: { targetUserId } },
      };

      const config = actionMap[action];
      if (config) {
        socket.emit(config.event, config.data);
      }
    },
    [socket],
  );

  const searchUsers = useCallback(
    (keyword: string) => {
      if (!keyword.trim()) return setSearchResults([]);
      socket?.emit('friends:search', { keyword });
    },
    [socket, setSearchResults],
  );

  const processedFriends = useMemo(() => {
    return friends
      .filter((f) =>
        f.nickname.toLowerCase().includes(searchKeyword.toLowerCase()),
      )
      .sort((a, b) => a.nickname.localeCompare(b.nickname));
  }, [searchKeyword, friends]);

  return {
    processedFriends,
    searchResults,
    recommendedFriends,
    handleFriendAction,
    requestFriend,
    searchUsers,
    isLoading,
  };
};
