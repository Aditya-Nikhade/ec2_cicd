import { useRef } from "react";
import { AiOutlinePaperClip } from "react-icons/ai";

const FileButton = ({ onFileSelected, disabled }) => {
  const fileRef = useRef(null);

  const handleClick = () => {
    if (fileRef.current) fileRef.current.click();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        disabled={disabled}
      >
        <AiOutlinePaperClip className="w-5 h-5 text-gray-600" />
      </button>
      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        ref={fileRef}
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files[0])}
      />
    </>
  );
};

export default FileButton;
