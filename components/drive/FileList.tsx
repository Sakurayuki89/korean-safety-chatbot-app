'use client';

import React, { useEffect } from 'react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { ApiDriveFile } from '@/types/google-drive';

interface FileListProps {
  onFileSelect: (file: ApiDriveFile) => void;
}

const FileList: React.FC<FileListProps> = ({ onFileSelect }) => {
  const { files, loading, error, fetchFiles } = useGoogleDrive();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  if (loading) {
    return <p>Loading files from Google Drive...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error fetching files: {error.message}</p>;
  }

  if (files.length === 0) {
    return <p>No PDF files found in your Google Drive.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your PDF Files</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {files.map((file) => (
          <li 
            key={file.id} 
            onClick={() => onFileSelect(file)}
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
            }}
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;