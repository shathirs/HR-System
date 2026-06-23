"use client";

import { useId, type ChangeEvent } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}

export default function FileUpload({
  label = "Upload file",
  accept,
  multiple = false,
  onChange,
}: FileUploadProps) {
  const inputId = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    onChange(files);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-body font-medium">
        {label}
      </label>

      <div className="rounded-lg border-2 border-dashed border-primary/30 bg-surface p-5 text-center transition hover:border-primary/50 hover:bg-primary/5">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1"
            />
          </svg>
        </div>

        <p className="text-body font-medium text-foreground">
          Drag and drop files here, or browse
        </p>
        <p className="mt-1 text-caption text-secondary">
          PDF, JPG, JPEG, PNG · Max 5 MB per file
        </p>

        <label
          htmlFor={inputId}
          className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-body font-medium text-white transition hover:bg-primary/90"
        >
          Choose Files
        </label>

        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="sr-only"
        />
      </div>
    </div>
  );
}
