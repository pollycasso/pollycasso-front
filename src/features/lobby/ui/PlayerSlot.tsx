import { useState } from 'react';
import {
  XMarkIcon,
  BellAlertIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { Crown } from '@/assets';
import { cn } from '@/shared/lib';
import { getOutfitImageUrl, OUTFIT_LAYERS } from '@/shared/lib/cdn';
import type { Player } from '@/shared/model';
import { getLevelColor } from '@/shared/lib/color';
import { useAuthStore } from '@/entities/user';

interface PlayerSlotProps {
  player?: Player;
  isHost: boolean;
  canKick: boolean;
  onKick: () => void;
  onNudge?: () => void;
  className?: string;
}

export const PlayerSlot = ({
  player,
  isHost,
  canKick,
  onKick,
  onNudge,
  className,
}: PlayerSlotProps) => {
  const { user } = useAuthStore();
  const isMe = player && String(player.userId) === String(user?.id);

  // 만약 내 슬롯인데 서버 데이터에 outfit이 없으면 내 로컬 정보를 우선 사용
  const hasLocalOutfit = user?.outfit && Object.keys(user.outfit).length > 0;
  let playerOutfit = isMe && hasLocalOutfit ? user.outfit : player?.outfit;
  // outfit이 비어있으면 Outfit 타입 전체 기본값으로 fallback
  if (
    !playerOutfit ||
    typeof playerOutfit !== 'object' ||
    Object.keys(playerOutfit).length === 0
  ) {
    playerOutfit = {
      bird: 'bird_01',
      accessory: null,
      hat: null,
      top: null,
      bottom: null,
      shoes: null,
      effect: null,
    };
  } else {
    // bird 레이어가 없으면 강제로 bird_01 추가
    if (!('bird' in playerOutfit) || !playerOutfit.bird) {
      playerOutfit = { ...playerOutfit, bird: 'bird_01' };
    }
    // 나머지 Outfit 필드도 누락 시 null로 보완
    playerOutfit = {
      bird: playerOutfit.bird,
      accessory: 'accessory' in playerOutfit ? playerOutfit.accessory : null,
      hat: 'hat' in playerOutfit ? playerOutfit.hat : null,
      top: 'top' in playerOutfit ? playerOutfit.top : null,
      bottom: 'bottom' in playerOutfit ? playerOutfit.bottom : null,
      shoes: 'shoes' in playerOutfit ? playerOutfit.shoes : null,
      effect: 'effect' in playerOutfit ? playerOutfit.effect : null,
    };
  }

  const [isCoolingDown, setIsCoolingDown] = useState(false);

  if (!player) {
    return (
      <div className="px-4 pt-6 rounded-2xl bg-black/20">
        <div className="flex justify-between items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-black/20"></div>
          <div className="w-36 h-9 rounded-full bg-black/20"></div>
        </div>
        <div className="w-full h-[200px] aspect-square rounded-lg bg-black/20"></div>
      </div>
    );
  }

  // 방장은 데이터상으로는 항상 준비 상태
  const isReadyVisual = player.isReady || isHost;

  const STATUS_CONFIG = {
    IDLE: { text: '대기', color: 'bg-gray-200 text-gray-500' },
    SHOPPING: {
      text: '쇼핑 중..',
      color: 'bg-[#FFD700] text-white border border-white',
    },
    CUSTOMIZING: {
      text: '단장 중..',
      color: 'bg-[#FF69B4] text-white border border-white',
    },
  };

  const currentStatus = (player.status as keyof typeof STATUS_CONFIG) || 'IDLE';
  const statusBadge = STATUS_CONFIG[currentStatus];

  const isBusy =
    player.status === 'SHOPPING' || player.status === 'CUSTOMIZING';

  // 재촉 가능 조건 (바쁨 + 재촉 기능 활성화됨)
  const canNudge = !!onNudge && isBusy;

  const handleNudgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCoolingDown) return;

    onNudge?.();
    setIsCoolingDown(true);

    setTimeout(() => {
      setIsCoolingDown(false);
    }, 3000);
  };

  return (
    <div
      className={cn(
        'w-full px-4 pt-6 rounded-2xl bg-white relative group transition-all duration-200',
        className,
      )}
    >
      {canKick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onKick();
          }}
          className={cn(
            'absolute -top-3 -right-3 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-[#FF553F] border-2 border-white text-white shadow-md transition-all duration-200',
            'hover:bg-[#FF331F] hover:scale-110 active:scale-95',
          )}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      {/* 재촉 오버레이 */}
      {canNudge && (
        <div
          onClick={handleNudgeClick}
          className={cn(
            'absolute inset-0 z-20 rounded-2xl bg-black/60 transition-opacity duration-500',
            'flex flex-col items-center justify-center backdrop-blur-[2px]',
            isCoolingDown
              ? 'opacity-100 cursor-default'
              : 'opacity-0 group-hover:opacity-100 cursor-pointer',
          )}
        >
          {isCoolingDown ? (
            <>
              <CheckCircleIcon className="w-12 h-12 text-[#2ADB75] mb-2 animate-pulse" />
              <span className="text-[#2ADB75] font-bold text-xl drop-shadow-md">
                전송 완료!
              </span>
            </>
          ) : (
            <>
              <BellAlertIcon className="w-12 h-12 text-white mb-2 animate-bounce" />
              <span className="text-white font-bold text-xl drop-shadow-md">
                재촉하기!
              </span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between w-full mb-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`relative flex justify-center items-center shrink-0 w-10 h-10 rounded-full ${getLevelColor(player.level)} text-white font-bold text-lg shadow-sm`}
          >
            {isHost && (
              <img
                src={Crown}
                alt="방장 왕관"
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-7 h-auto z-10 drop-shadow-sm pointer-events-none"
              />
            )}
            {player.level}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div
              className="text-2xl font-bold text-gray-800 truncate"
              title={player.nickname}
              style={{ display: 'block' }}
            >
              {player.nickname}
            </div>
          </div>
        </div>

        <div className="shrink-0 ml-2">
          {!isHost && player.isReady ? (
            <span className="px-2.5 py-1 rounded-full text-md font-bold text-white bg-[#2ADB75]">
              준비
            </span>
          ) : (
            (!isHost || currentStatus !== 'IDLE') && (
              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-md font-bold shadow-sm',
                  statusBadge.color,
                )}
              >
                {statusBadge.text}
              </span>
            )
          )}
        </div>
      </div>

      <div
        className={cn(
          'relative flex items-center justify-center w-full h-[215px] aspect-square overflow-hidden bg-[#E3DDDD] rounded-lg transition-all duration-300 box-border',
          // 테두리 우선순위 로직
          // 1. 재촉 가능(바쁨) -> 무조건 빨간색 (호버 여부 상관없음!)
          // 2/ 준비 완료 -> 초록색
          // 3. 기본 -> 투명
          canNudge
            ? 'border-[5px] border-[#FF553F]'
            : isReadyVisual
              ? 'border-[5px] border-[#2ADB75]'
              : 'border-[5px] border-transparent',
        )}
      >
        {OUTFIT_LAYERS.map((layer) => {
          let partId: string | null = null;

          // 서버가 데이터를 중첩해서 보낼 수도 있으므로 모든 경로 탐색
          const hasOutfit = (obj: any) =>
            obj && typeof obj === 'object' && Object.keys(obj).length > 0;

          let rawData: any = playerOutfit;
          if (!hasOutfit(rawData)) {
            rawData =
              (player as any).user?.outfit ||
              (player as any).userOutfit ||
              (player as any).memberOutfit ||
              (player as any).costume ||
              (player as any).costumeData ||
              (player as any).appearance ||
              (player as any).appearanceData;
          }

          // ...existing code...

          let processedOutfit = rawData;
          if (
            typeof rawData === 'string' &&
            (rawData.includes('{') || rawData.includes('['))
          ) {
            try {
              processedOutfit = JSON.parse(rawData);
            } catch (e) {
              // 파싱 실패하더라도 rawData가 단순 이미지 ID일 수 있으므로 bird 레이어에 할당 시도
              if (layer === 'bird') partId = rawData as string;
            }
          }

          if (Array.isArray(processedOutfit)) {
            const categoryMap: Record<string, string[]> = {
              bird: ['BIRD', '새', 'BODY', 'body'],
              accessory: ['ACCESSORY', 'ACC', '액세서리', 'acc'],
              hat: ['HAT', '모자', 'hat'],
              top: ['TOP', '상의', 'top'],
              bottom: ['BOTTOM', '하의', 'bottom'],
              shoes: ['SHOES', '신발', 'shoes'],
              effect: ['EFFECT', '효과', 'effect'],
            };
            const targetCategories = categoryMap[layer] || [
              layer.toUpperCase(),
            ];

            const item = (processedOutfit as any[]).find((i: any) => {
              // 아이템 자체가 문자열일 경우 (["bird_01", "hat_07"])
              if (typeof i === 'string') {
                const lowerLayer = layer.toLowerCase();
                const lowerI = i.toLowerCase();
                if (lowerLayer === 'bird')
                  return lowerI.includes('bird') || lowerI.includes('body');
                if (lowerLayer === 'accessory')
                  return lowerI.includes('acc') || lowerI.includes('accessory');
                return lowerI.includes(lowerLayer);
              }
              const cat = (
                i?.subCategory ||
                i?.category ||
                i?.type ||
                i?.kind ||
                ''
              ).toUpperCase();
              return targetCategories.includes(cat);
            });

            if (item) {
              if (typeof item === 'string') {
                partId = item;
              } else {
                // 명세서에 따라 image 필드를 최우선으로 사용
                partId =
                  item.image ||
                  item.outfitImage ||
                  item.imageUrl ||
                  item.url ||
                  item.imagePath ||
                  (typeof item.id === 'string' ? item.id : null);
              }
            }
          } else if (processedOutfit && typeof processedOutfit === 'object') {
            const keyMap: Record<string, string[]> = {
              bird: ['bird', 'BIRD', 'BODY', 'body'],
              accessory: ['accessory', 'ACCESSORY', 'acc', 'ACC'],
              hat: ['hat', 'HAT'],
              top: ['top', 'TOP'],
              bottom: ['bottom', 'BOTTOM'],
              shoes: ['shoes', 'SHOES'],
              effect: ['effect', 'EFFECT'],
            };
            const possibleKeys = keyMap[layer] || [
              layer,
              layer.toUpperCase(),
              layer.toLowerCase(),
            ];

            for (const key of possibleKeys) {
              const val = (processedOutfit as any)[key];
              if (val !== undefined && val !== null) {
                // 값이 문자열이면 바로 ID, 객체면 image 속성 탐색
                partId =
                  typeof val === 'string'
                    ? val
                    : val.image ||
                      val.outfitImage ||
                      val.imageUrl ||
                      val.url ||
                      val.imagePath ||
                      null;

                // 만약 단순 숫자 ID만 온다면 (과거 데이터 호완용), bird_01 등과 같은 형식 유추 시도
                if (typeof val === 'number' && !partId) {
                  if (layer === 'bird') partId = `bird_01`; // ID에 따른 매핑 로직이 없다면 기본값
                }
                break;
              }
            }
          }

          // 새(bird) 레이어인데 partId가 없으면 기본 새 이미지 사용
          if (layer === 'bird' && !partId) {
            partId = 'bird_01';
          }

          if (!partId || typeof partId !== 'string') return null;

          return (
            <img
              key={layer}
              src={getOutfitImageUrl(partId)}
              alt={layer}
              className="absolute inset-0 w-full h-[200px] object-contain"
              style={{ zIndex: OUTFIT_LAYERS.indexOf(layer) }}
            />
          );
        })}
      </div>
    </div>
  );
};
