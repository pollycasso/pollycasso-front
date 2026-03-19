import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { Match } from '../model/types';

interface MatchDetailProps {
  match: Match | undefined;
  onBack: () => void;
}

export const MatchDetail = ({ match, onBack }: MatchDetailProps) => {
  if (!match) return null;

  return (
    <div className="mx-auto">
      <div className="flex items-center gap-1 mb-2 text-[#B4B4B4] font-bold">
        <span className="text-sm">상세내용</span>
        <InformationCircleIcon className="w-4 h-4" />
      </div>

      <div className="bg-[#1D3A0F] text-white p-3 mb-5 font-bold">
        방 이름: {match.title}
      </div>

      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-gray-200 text-left">
            <tr className="bg-[#F8F9FA]">
              <th className="p-4 w-48 border-r border-gray-200 text-gray-700 font-bold">
                방 번호
              </th>
              <td className="p-4 text-gray-600 font-medium">{match.roomNum}</td>
            </tr>

            <tr>
              <th className="p-4 border-r border-gray-200 text-gray-700 font-bold">
                방장
              </th>
              <td className="p-4 text-gray-600">{match.creatorId}</td>
            </tr>

            <tr className="bg-[#F8F9FA]">
              <th className="p-4 border-r border-gray-200 text-gray-700 font-bold">
                참가자
              </th>
              <td className="p-4 h-32 align-top text-gray-600 leading-relaxed">
                <div className="flex flex-wrap gap-2">
                  {match.participants.map((p, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 px-2 py-1 rounded text-sm border border-gray-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </td>
            </tr>

            <tr>
              <th className="p-4 border-r border-gray-200 text-gray-700 font-bold">
                최종 결과
              </th>
              <td className="p-4 text-left font-bold text-[#1D3A0F]">
                {match.result}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-4 mt-16">
        <button
          onClick={onBack}
          className="border border-gray-300 px-10 py-2 rounded bg-white shadow hover:bg-gray-50 text-gray-600 font-medium"
        >
          이전화면
        </button>
      </div>
    </div>
  );
};
