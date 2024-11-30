import React, { useEffect, useState } from 'react'

interface SummarizerBlockProps {
  onClose: () => void
  summarizedText: string
}

export const SummarizerBlock: React.FC<SummarizerBlockProps> = ({ onClose, summarizedText }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        zIndex: 1000,
        position: 'relative',
        opacity: 1,
        visibility: 'visible',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '20rem',
      }}
    >
      <h3 style={{ color: '#000', fontSize: '14px' }}>Summarizer Block</h3>{' '}
      <p style={{ color: '#333', fontSize: '10px' }}>
        {summarizedText ? summarizedText : 'Loading summary...'}
      </p>
    </div>
  )
}

export default SummarizerBlock
