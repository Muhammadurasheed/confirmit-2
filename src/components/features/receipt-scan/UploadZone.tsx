import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const UploadZone = ({ onFileSelected, disabled }: UploadZoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onFileSelected(file);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    multiple: false,
    disabled,
  });

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onDrop([file]);
      }
    };
    input.click();
  }, [onDrop]);

  const clearFile = useCallback(() => {
    setPreview(null);
    setSelectedFile(null);
  }, []);

  if (preview) {
    return (
      <Card className="relative overflow-hidden">
        <img
          src={preview}
          alt="Receipt preview"
          className="w-full h-auto max-h-96 object-contain"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-4 right-4"
          onClick={clearFile}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="p-4 bg-muted/50 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedFile?.name} ({(selectedFile?.size! / 1024).toFixed(0)} KB)
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      {...getRootProps()}
      className={`border-2 border-dashed transition-all cursor-pointer hover:border-primary/50 ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-border'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="p-12 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {isDragActive ? 'Drop receipt here' : 'Upload Receipt'}
          </h3>
          <p className="text-muted-foreground">
            Drag and drop or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: PNG, JPG, JPEG, WebP (Max 10MB)
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" className="gap-2" disabled={disabled}>
            <FileImage className="h-4 w-4" />
            Choose File
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleCameraCapture();
            }}
            disabled={disabled}
          >
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>
        </div>
      </div>
    </Card>
  );
};
