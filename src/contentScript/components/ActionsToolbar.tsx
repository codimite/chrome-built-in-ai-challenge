import React, { useEffect, useState } from 'react'
import { Card, Progress, Text, Button, Group, Loader, Image } from '@mantine/core'
import { BsPen } from 'react-icons/bs'
import { IoMdSync } from 'react-icons/io'
import { MdOutlineSegment } from 'react-icons/md'
import intelliwriteLogo from '../../assets/int-blue-16.png'
import { VisibleButtons } from '../../constants'
// import '@mantine/core/styles.css'

interface ActionsToolbarProps {
    onSummarize: () => void
    onRewrite: () => void
    onClose: () => void
    onRedact: () => void
    visibleButtons: VisibleButtons
    summarizeBtnLabel?: string
}
export const ActionsToolbar: React.FC<ActionsToolbarProps> = ({
    onSummarize,
    onRewrite,
    onRedact,
    onClose,
    visibleButtons,
    summarizeBtnLabel = 'Summarize',
}) => {
    const [loading, setLoading] = useState(false)
    const [colorscheme, setColorScheme] = useState()

    const intelliwriteLogo_blue = chrome.runtime.getURL('img/int-blue-34.png')
    const intelliwriteLogo_white = chrome.runtime.getURL('img/int-w-128.png')
    // set the color scheme
    useEffect(() => {
        chrome.storage.sync.get(['colorScheme']).then((res) => {
            const scheme = res.colorScheme || 'light' // Default to 'light' if colorScheme is undefined or null
            setColorScheme(scheme)
        })
    }, [])

    // handle onClicks for rewriter
    const handleRewriterClick = async () => {
        try {
            setLoading(true) // Start the loading animation

            // Wait for the onRewrite function to complete
            await onRewrite()

            // Optionally call onClose after the operation
            onClose()
        } catch (error) {
            console.error('Error during Rewrite operation:', error)
        } finally {
            setLoading(false) // Stop the loading animation
        }
    }

    // handle onClicks for redact
    const handleReadctClick = async () => {
        try {
            setLoading(true) // Start the loading animation

            // Wait for the onRedact function to complete
            await onRedact()

            // Optionally call onClose after the operation
            onClose()
        } catch (error) {
            console.error('Error during Redact operation:', error)
        } finally {
            setLoading(false) // Stop the loading animation
        }
    }

    // handle onClicks for summarizer
    const handleSummarizerClick = async () => {
        try {
            setLoading(true) // Start the loading animation

            // Wait for the onRedact function to complete
            await onSummarize()
            console.log('Summarization complete')

            // Optionally call onClose after the operation

            onClose()
        } catch (error) {
            console.error('Error during Summarize operation:', error)
        } finally {
            setLoading(false) // Stop the loading animation
        }
    }

    return (
        <>
            <Card shadow="sm" radius="md" withBorder p="xs">
                {loading ? (
                    //   <Loader color="grape" size="xs" type="bars" />
                    <div
                        id="loader"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            className="loader-container"
                            style={{ width: '40px', height: '30px', position: 'relative' }}
                        >
                            <div
                                className="bar"
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',
                                    width: '8px',
                                    height: '75%',
                                    backgroundColor: '#3498db',
                                    animation: 'barAnimation 1.2s infinite',
                                }}
                            ></div>
                            <div
                                className="bar"
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '15px',
                                    width: '8px',
                                    height: '75%',
                                    backgroundColor: '#3498db',
                                    animation: 'barAnimation 1.2s 0.2s infinite',
                                }}
                            ></div>
                            <div
                                className="bar"
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '30px',
                                    width: '8px',
                                    height: '75%',
                                    backgroundColor: '#3498db',
                                    animation: 'barAnimation 1.2s 0.4s infinite',
                                }}
                            ></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                gap: '16px',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                backgroundColor: colorscheme === 'dark' ? '#333' : '#f9f9f9',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    flexWrap: 'nowrap',
                                    alignItems: 'center',
                                }}
                            >
                                <img
                                    src={
                                        colorscheme === 'light'
                                            ? intelliwriteLogo_blue
                                            : intelliwriteLogo_white
                                    }
                                    alt="Placeholder Logo"
                                    height={25}
                                    width={25}
                                    style={{ marginRight: '2px' }}
                                />
                                {visibleButtons.includes('rewrite') && (
                                    <Text
                                        size="sm"
                                        fw={500}
                                        component="span"
                                        style={{
                                            color: colorscheme === 'dark' ? '#fff' : 'black',
                                            cursor: 'pointer',
                                            margin: 0,
                                            fontSize: 14,
                                        }}
                                        onClick={handleRewriterClick}
                                    >
                                        <BsPen size={10} style={{ marginRight: '4px' }} />
                                        Rewrite
                                    </Text>
                                )}

                                {visibleButtons.includes('redact') && (
                                    <Text
                                        size="sm"
                                        fw={500}
                                        component="span"
                                        style={{
                                            color: colorscheme === 'dark' ? '#fff' : 'black',
                                            cursor: 'pointer',
                                            margin: 0,
                                            fontSize: 14,
                                        }}
                                        onClick={handleReadctClick}
                                    >
                                        <IoMdSync size={15} style={{ marginRight: '4px' }} />
                                        Redact
                                    </Text>
                                )}

                                {visibleButtons.includes('summarize') && (
                                    <Text
                                        size="sm"
                                        fw={500}
                                        component="span"
                                        style={{
                                            color: colorscheme === 'dark' ? '#fff' : 'black',
                                            cursor: 'pointer',
                                            margin: 0,
                                            fontSize: 14,
                                        }}
                                        onClick={handleSummarizerClick}
                                    >
                                        <MdOutlineSegment
                                            size={14}
                                            style={{ marginRight: '4px' }}
                                        />
                                        {summarizeBtnLabel}
                                    </Text>
                                )}
                            </div>
                        </div>
                    </>
                )}
                <style>
                    {`
          @keyframes barAnimation {
            0% {
              transform: scaleY(0);
            }
            50% {
              transform: scaleY(1);
            }
            100% {
              transform: scaleY(0);
            }
          }
          
          .loader-container .bar {
            position: absolute;
            top: 0;
            bottom: 0;
            animation: barAnimation 1.2s infinite ease-in-out;
          }
        `}
                </style>
            </Card>
        </>
    )
}

export default ActionsToolbar
