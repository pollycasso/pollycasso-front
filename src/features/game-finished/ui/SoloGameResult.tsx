import { SoloPodium } from '@/assets';
import { BACKGROUND_FIREWORKS, FOREGROUND_FIREWORKS } from '../model/fireworks';
import { FireworksLayer } from './FireworksLayer';
import { SoloPodiumSpot } from './SoloPodiumSpot';
import { RankRow } from './RankRow';
import type { FinishedPlayer } from '../model/types';

interface SoloGameResultProps {
  results: FinishedPlayer[];
}

export const SoloGameResult = ({ results }: SoloGameResultProps) => {
  // 랭킹 분류 로직
  const podiumMembers = results.filter((r) => r.rank <= 3);
  const listMembers = results.filter((r) => r.rank > 3);

  const getPodiumMember = (rank: number) =>
    podiumMembers.find((r) => r.rank === rank);

  const firstPlace = getPodiumMember(1);
  const secondPlace = getPodiumMember(2);
  const thirdPlace = getPodiumMember(3);

  return (
    <div className="relative w-[1000px]">
      <FireworksLayer items={BACKGROUND_FIREWORKS} />

      <img
        src={SoloPodium}
        alt="Game Finished Podium"
        className="w-full object-contain drop-shadow-2xl"
      />

      {firstPlace && (
        <SoloPodiumSpot
          rank={1}
          nickname={firstPlace.nickname}
          coins={firstPlace.coinsGained}
          xp={firstPlace.expGained}
          score={firstPlace.totalScore}
        />
      )}

      {secondPlace && (
        <SoloPodiumSpot
          rank={2}
          nickname={secondPlace.nickname}
          coins={secondPlace.coinsGained}
          xp={secondPlace.expGained}
          score={secondPlace.totalScore}
        />
      )}

      {thirdPlace && (
        <SoloPodiumSpot
          rank={3}
          nickname={thirdPlace.nickname}
          coins={thirdPlace.coinsGained}
          xp={thirdPlace.expGained}
          score={thirdPlace.totalScore}
        />
      )}

      {listMembers.map((member, index) => {
        const topPosition = 120 + index * 80;

        return (
          <RankRow
            key={member.userId}
            rank={member.rank}
            nickname={member.nickname}
            coins={member.coinsGained}
            xp={member.expGained}
            score={member.totalScore}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `${topPosition}%` }}
          />
        );
      })}

      <FireworksLayer items={FOREGROUND_FIREWORKS} />
    </div>
  );
};
