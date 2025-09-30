"use client";

import React from 'react';

interface AudioData {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
}

interface StaticPlayButtonProps {
  contentId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  playButtonStyle: 'circle' | 'rectangle';
  onPlay: (audioData: AudioData) => void;
}

export const StaticPlayButton: React.FC<StaticPlayButtonProps> = ({
  contentId,
  title,
  description,
  audioUrl,
  duration,
  playButtonStyle,
  onPlay
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  const handleClick = () => {
    // 単純にトグル動作
    onPlay({
      id: contentId,
      title,
      description,
      audioUrl,
      duration,
    });
  };

  // 固定スタイル（ホバー効果を完全に無効化）
  const buttonStyle = playButtonStyle === 'circle' 
    ? {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb !important',
        color: 'white !important',
        border: 'none !important',
        cursor: 'pointer',
        outline: 'none !important',
        boxShadow: 'none !important',
        transition: 'none !important',
        transform: 'none !important'
      } as React.CSSProperties
    : {
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: '#2563eb !important',
        color: 'white !important',
        border: 'none !important',
        cursor: 'pointer',
        fontSize: '14px',
        outline: 'none !important',
        boxShadow: 'none !important',
        transition: 'none !important',
        transform: 'none !important'
      } as React.CSSProperties;

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      style={buttonStyle}
      className="no-hover-effects"
      onMouseEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        target.style.backgroundColor = '#2563eb';
        target.style.transform = 'none';
        target.style.boxShadow = 'none';
      }}
      onMouseLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        target.style.backgroundColor = '#2563eb';
        target.style.transform = 'none';
        target.style.boxShadow = 'none';
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {playButtonStyle === 'circle' ? (
        // 固定の一時停止アイコン
        <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zM14 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ) : (
        '一時停止'
      )}
    </button>
  );
};