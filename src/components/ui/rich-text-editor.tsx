'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR window is not defined errors
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-md" />
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  // Memoize modules to prevent re-rendering/loss of focus
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link',
    'clean'
  ];

  return (
    <div className={`rich-text-editor-container ${className}`}>
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-48 mb-12" // Leave space for the toolbar bottom overlap
      />
      <style jsx global>{`
        .rich-text-editor-container .ql-container {
          font-family: inherit;
          font-size: 0.875rem;
          background-color: white;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .rich-text-editor-container .ql-toolbar {
          background-color: #f8fafc;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: #e2e8f0;
        }
        .rich-text-editor-container .ql-editor {
          min-height: 12rem;
        }
      `}</style>
    </div>
  );
}
