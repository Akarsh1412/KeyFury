import { RotateCcw } from 'lucide-react';
import { useRef } from 'react';

function RestartButton({ handleRestart }) {
  const buttonRef = useRef(null);

  function handleClick() {
    handleRestart();
    buttonRef.current?.blur();
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="flex items-center gap-2 bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-5 py-2 rounded-md shadow-md transition font-medium"
    >
      <RotateCcw className="w-5 h-5" />
      Restart
    </button>
  );
}

export default RestartButton;