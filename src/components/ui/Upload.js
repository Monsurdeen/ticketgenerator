import { useEffect, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import Image from 'next/image';

export function Upload({ onChange, onError, initialPreview = null }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setPreview(initialPreview);
  }, [initialPreview]);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError?.('Please upload a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError?.('The image must be smaller than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onChange(reader.result);
    };
    reader.onerror = () => onError?.('The image could not be read.');
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => processFile(event.target.files?.[0]);

  return (
    <div className="flex flex-col items-center">
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          processFile(event.dataTransfer.files?.[0]);
        }}
        className="relative flex h-52 w-52 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-teal-300/40 bg-[#081f24] cursor-pointer transition hover:border-teal-300 hover:bg-[#0b292f]"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Uploaded profile preview"
            width={240}
            height={240}
            unoptimized
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-blue-400 mb-2" />
            <p className="text-sm text-blue-400">Drag & drop or click to upload</p>
          </div>
        )}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
}
