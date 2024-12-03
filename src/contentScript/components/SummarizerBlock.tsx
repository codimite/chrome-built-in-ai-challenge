import React, { useEffect, useState } from 'react'

interface SummarizerBlockProps {
    onClose: () => void
    summarizedText: string
}

export const SummarizerBlock: React.FC<SummarizerBlockProps> = ({ onClose, summarizedText }) => {
    const [colorscheme, setColorScheme] = useState()

    const logoURL_blue = chrome.runtime.getURL('img/int-blue-128.png')
    const logoURL_white = chrome.runtime.getURL('img/int-w-128.png')

    useEffect(() => {
        chrome.storage.sync.get(['colorScheme']).then((res) => {
            const scheme = res.colorScheme || 'light';
            setColorScheme(scheme);
        })
    }, [])
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: colorscheme === 'dark' ? '#333' : '#f9f9f9',
                zIndex: 1000,
                position: 'relative',
                opacity: 1,
                visibility: 'visible',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                maxWidth: '20rem',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <img
                    src={ colorscheme === 'light' ? logoURL_blue : logoURL_white }
                    alt="Logo"
                    style={{
                        opacity: 1,
                        marginRight: '8px',
                        width: '24px',
                        height: '24px',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        marginLeft: '2px',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'space-between',
                    }}
                >
                    <span
                        style={{
                            color: colorscheme === 'light' ? '#000' : '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                    >
                        IntelliWrite
                    </span>
                    <span
                        style={{
                            color: '#3498db',
                            fontSize: '12px',
                            cursor: 'pointer',
                            paddingRight: '8px',
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(summarizedText || '')
                            alert('Copied From Intelliwrite!')
                        }}
                    >
                        Copy
                    </span>
                </div>
            </div>
            <div
                style={{
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'inline-block',
                }}
            >
                <p style={{ color: '#333', fontSize: '14px' }}>
                    {summarizedText ? summarizedText : 'Loading summary...'}
                </p>
            </div>
        </div>
    )
}

export default SummarizerBlock
