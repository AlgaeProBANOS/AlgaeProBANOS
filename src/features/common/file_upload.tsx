import { useRef } from 'react';

import { useAppDispatch } from '@/app/store';
import { setData } from '@/app/store/memorise.slice';

import { Button } from '../ui/button';

export default function FileUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Optional chaining to avoid errors

    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target?.result as string);
          if (parsedData.fragmentsByID != null) {
            dispatch(setData(parsedData));
          }
        } catch (error) {
          console.error('Invalid JSON file', error);
          alert('Invalid JSON format. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file.');
    }
  };

  return (
    <div>
      {/* Hidden file input */}
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Button triggers file input */}
      <Button
        onClick={() => {
          return fileInputRef.current?.click();
        }}
      >
        Upload JSON
      </Button>
    </div>
  );
}
