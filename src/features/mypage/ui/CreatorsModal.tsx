import { Modal } from '@/shared/ui/Modal';

interface CreatorsModalProps {
  onClose: () => void;
}

export const CreatorsModal = ({ onClose }: CreatorsModalProps) => {
  return (
    <Modal
      onClose={onClose}
      confirmText="감사합니다"
      onConfirm={onClose}
      cancelText="돌아가기"
    >
      <div className="flex flex-col items-center gap-y-4 text-gray-800 font-ssrm">
        <h2 className="text-4xl font-bold text-[#153712]">
          폴리카소(Pollycasso)
        </h2>
        <div className="w-32 h-1 bg-gray-100 rounded-full" />

        <div className="flex flex-col items-center gap-y-2 mt-2">
          <p className="text-2xl font-bold text-green-700">
            Modern Agile 10term
          </p>
          <p className="text-xl font-medium">Seohyun Lim, Jisue Kim</p>
          <p className="text-xl font-medium">
            Gihyeon Jeong, Jieun Youn, Donghun Lee
          </p>
        </div>

        <div className="flex flex-col items-center gap-y-1 mt-4 text-center">
          <p className="text-lg">Special Thanks to</p>
          <p className="text-xl font-semibold">Modern Agile Team</p>
          <p className="text-sm text-gray-400 mt-4">And you</p>
        </div>
      </div>
    </Modal>
  );
};
