import { Upload } from "lucide-react";

interface UploadBoxProps {
  file?: File;
  onFileSelect?: (file: File) => void;
}

export function UploadBox({ file, onFileSelect }: UploadBoxProps) {
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
          onFileSelect?.(droppedFile);
        }
      }}
      className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition hover:border-neutral-400"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white">
        <Upload className="h-5 w-5 text-neutral-700" />
      </div>
      <p className="mt-3 text-sm font-black">Choose a file or drag & drop it here</p>
      <p className="mt-1 text-xs text-neutral-500">
        {file ? file.name : "PDF, TXT, JPEG, PNG up to 10MB"}
      </p>
      <label className="mt-4 inline-flex cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-xs font-black outline-none transition hover:bg-neutral-50 focus-within:ring-2 focus-within:ring-ink/10">
        Browse Files
        <input
          className="sr-only"
          type="file"
          accept=".pdf,.txt,.jpg,.jpeg,.png"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onFileSelect?.(file);
            }
          }}
        />
      </label>
    </div>
  );
}
