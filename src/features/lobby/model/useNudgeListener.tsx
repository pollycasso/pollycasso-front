import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { overlay } from 'overlay-kit';
import { getWaitingSocket } from '@/shared/api/socket';
import { NudgeModal } from '@/features/lobby';
import { useSound } from '@/entities/sound';
import { SoundManager } from '@/shared/api/sound/manager';
import { SOUND_ASSETS } from '@/shared/api/sound/assets';

export const useNudgeListener = () => {
  const waitingSocket = getWaitingSocket();

  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { sfxVolume, isMuted } = useSound();

  useEffect(() => {
    if (!waitingSocket) return;

    const handleNudge = ({ senderId }: { senderId: string }) => {
      if (!isMuted)
        SoundManager.playSfx(SOUND_ASSETS.SFX.LOBBY_JOINED2, sfxVolume);
      overlay.open(({ unmount }) => {
        return (
          <NudgeModal
            close={() => unmount()}
            onConfirm={() => {
              if (roomId) {
                navigate(`/rooms/${roomId}`);
              }
            }}
          />
        );
      });
    };

    waitingSocket.on('room:nudged', handleNudge);

    return () => {
      waitingSocket.off('room:nudged', handleNudge);
    };
  }, [waitingSocket, roomId, navigate]);
};
