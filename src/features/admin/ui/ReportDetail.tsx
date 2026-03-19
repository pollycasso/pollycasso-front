import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { Report } from '../model/types';

interface ReportDetailProps {
  report: Report | undefined;
  onApply: () => void;
  onBack: () => void;
}

export const ReportDetail = ({
  report,
  onApply,
  onBack,
}: ReportDetailProps) => {
  if (!report) return null;

  return (
    <div className=" mx-auto">
      <div className="flex items-center gap-1 mb-2 text-[#B4B4B4] font-bold">
        <span className="text-sm">상세내용</span>
        <InformationCircleIcon className="w-4 h-4" />
      </div>
      <div className="bg-[#1D3A0F] text-white p-3 mb-5 font-bold ">신고</div>

      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-gray-200 text-left">
            <tr className="bg-[#F8F9FA]">
              <th className="p-4 w-48 border-r border-gray-200 text-gray-700 font-bold">
                신고자 태그
              </th>
              <td className="p-4 text-gray-600">{report.tag}</td>
            </tr>
            <tr>
              <th className="p-4 border-r border-gray-200 text-gray-700 font-bold">
                신고자 닉네임
              </th>
              <td className="p-4 text-gray-600">{report.nickname}</td>
            </tr>
            <tr className="bg-[#F8F9FA]">
              <th className="p-4 border-r border-gray-200 text-gray-700 font-bold">
                신고 내용
              </th>
              <td className="p-4 h-32 align-top text-gray-600 leading-relaxed">
                {report.content}
              </td>
            </tr>
            <tr>
              <th className="p-4 border-r border-gray-200 text-gray-700 font-bold">
                최종 결과
              </th>
              <td className="p-4 text-left">
                <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white outline-none">
                  <option>1일 정지</option>
                  <option>3일 정지</option>
                  <option>7일 정지</option>
                  <option>신고 사항 없음</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-4 mt-16">
        <button
          onClick={onApply}
          className="bg-[#849484] text-white px-10 py-2 rounded shadow hover:bg-[#1D3A0F] transition-all font-medium"
        >
          적용
        </button>
        <button
          onClick={onBack}
          className="border border-gray-300 px-10 py-2 rounded bg-white shadow hover:bg-gray-50 text-gray-600"
        >
          이전화면
        </button>
      </div>
    </div>
  );
};
