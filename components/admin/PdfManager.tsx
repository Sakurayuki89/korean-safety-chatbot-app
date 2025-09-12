'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';

interface ManagedPdf {
  id: string;
  fileName: string;
  uploadDate: string;
  size: number; // in bytes
}

const PdfManager = () => {
  const [pdfs, setPdfs] = useState<ManagedPdf[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    const res = await fetch('/api/admin/pdfs');
    const data = await res.json();
    setPdfs(data);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('PDF 파일을 선택해주세요.');
      return;
    }

    const fileInfo = { fileName: file.name, size: file.size };

    const res = await fetch('/api/admin/pdfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileInfo),
    });

    if (res.ok) {
      fetchPdfs();
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    } else {
      alert('파일 정보 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 PDF 파일을 삭제하시겠습니까?')) return;
    const res = await fetch('/api/admin/pdfs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchPdfs();
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">PDF 파일 관리</h2>
      <form onSubmit={handleUpload} className="mb-6">
        <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-300 mb-2">새 PDF 업로드</label>
        <div className="flex items-center space-x-2">
          <input 
            id="pdf-upload"
            type="file" 
            ref={fileInputRef} 
            accept=".pdf"
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold whitespace-nowrap">업로드</button>
        </div>
      </form>
      <div className="space-y-4">
        {pdfs.map((pdf) => (
          <div key={pdf.id} className="p-4 bg-gray-700 rounded-md flex justify-between items-center">
            <div>
              <p className="font-bold">{pdf.fileName}</p>
              <p className="text-xs text-gray-400 mt-1">{(pdf.size / 1024 / 1024).toFixed(2)} MB - {pdf.uploadDate}</p>
            </div>
            <button onClick={() => handleDelete(pdf.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm">삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfManager;
