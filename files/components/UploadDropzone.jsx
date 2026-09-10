import { useRef, useState } from "react";

export default function UploadDropzone({ onFileSelected, busy }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    if (files && files[0]) onFileSelected(files[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`border border-dashed rounded cursor-pointer px-6 py-8 text-center transition-colors ${
        dragOver ? "border-accent bg-accentSoft/40" : "border-hairline hover:border-faint"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {busy ? (
        <p className="text-sm text-muted font-mono">parsing resume…</p>
      ) : (
        <>
          <p className="text-sm text-ink">Drop a resume here, or click to browse</p>
          <p className="text-xs text-faint mt-1">PDF, DOCX, or TXT</p>
        </>
      )}
    </div>
  );
}
