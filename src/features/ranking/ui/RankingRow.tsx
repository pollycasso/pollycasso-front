import { Crown } from '@/assets';
import { maskId } from '@/shared/lib/mask';
import { MiniAvatar } from './MiniAvatar';
import type { RankingUser } from '../model/types';

interface RankingRowProps {
  user: RankingUser;
  index: number;
}

export const RankingRow = ({ user, index }: RankingRowProps) => {
  const isFirst = user.rank === 1;

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <div
      className={`w-full h-full flex items-center ${
        index === 1 ? 'border-y border-white' : index === 2 ? 'border-b' : ''
      }`}
    >
      <div className="relative w-[5%] flex justify-center px-2">
        {isFirst && (
          <img
            src={Crown}
            alt="crown"
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-auto"
          />
        )}
        <span className="text-3xl">
          {user.rank}
          {getRankSuffix(user.rank)}
        </span>
      </div>

      <div className="w-[10%] flex justify-end">
        <MiniAvatar outfit={user.outfit} />
      </div>

      <div className="w-[23%] truncate text-center">
        <span className="text-2xl">{user.nickname}</span>
      </div>
      <div className="w-[18%] truncate text-center">
        <span className="text-2xl">{maskId(user.username)}</span>
      </div>
      <div className="w-[17%] text-center">
        <span className="text-2xl">Lv.{user.level}</span>
      </div>
      <div className="w-[27%] text-center">
        <span className="text-3xl font-bold">
          {user.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
