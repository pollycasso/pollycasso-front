import { useEffect } from 'react';
import { useSocket } from '@/shared/api/socket';
import { showToast } from '@/shared/ui/Toast';

interface NotificationPayload {
  status: number;
  code: string;
  errors?: any[];
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  // 친구 신청 관련
  USER_NOT_FOUND: '존재하지 않는 닉네임입니다.',
  ALREADY_FRIEND: '이미 친구인 사용자입니다.',
  ALREADY_SENT_REQUEST: '이미 친구 신청을 보냈습니다.',
  CANNOT_REQUEST_SELF: '자기 자신에게는 신청할 수 없습니다.',
  BLOCKED_BY_TARGET: '상대방이 요청을 거절한 상태입니다.', // 차단 순화
  TOO_MANY_REQUESTS: '친구 신청 제한 횟수를 초과했습니다.',

  // 신청 수락/거절 관련
  REQUEST_NOT_FOUND: '유효하지 않거나 삭제된 요청입니다.',
  REQUEST_ALREADY_PROCESSED: '이미 처리된 요청입니다.',
  FRIEND_LIST_FULL: '내 친구 목록이 가득 찼습니다.',

  // 삭제/차단 관련
  NOT_A_FRIEND: '친구 관계가 아닙니다.',
  ALREADY_BLOCKED: '이미 차단된 사용자입니다.',
  UNAUTHORIZED_ACTION: '권한이 없습니다.',
};

export const SocketGlobalAlert = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload: NotificationPayload) => {
      const { status, code, message } = payload;

      const displayMessage =
        ERROR_MESSAGES[code] || message || '알 수 없는 오류가 발생했습니다.';

      if (status >= 400) {
        showToast.error(displayMessage);
      } else if (status === 200) {
        showToast.success(message || '요청이 성공적으로 처리되었습니다.');
      } else {
        showToast.info(displayMessage);
      }
    };

    socket.on('system:notification', handleNotification);

    return () => {
      socket.off('system:notification', handleNotification);
    };
  }, [socket]);

  return null;
};
