import React, { useState } from 'react'
import { Card, Progress, Text, Button, Group, Loader, Image } from '@mantine/core'
import { BsPen } from 'react-icons/bs'
import { IoMdSync } from 'react-icons/io'
import { MdOutlineSegment } from 'react-icons/md'
import intelliwriteLogo from '../../assets/int-blue-16.png'
// import '@mantine/core/styles.css'

interface ActionsToolbarProps {
  onSummarize: () => void
  onRewrite: () => void
  onClose: () => void
  onRedact: () => void
}
export const ActionsToolbar: React.FC<ActionsToolbarProps> = ({
  onSummarize,
  onRewrite,
  onRedact,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)

  // handle onClicks for rewriter
  const handleRewriterClick = async () => {
    try {
      setLoading(true); // Start the loading animation
  
      // Wait for the onRewrite function to complete
      await onRewrite();
  
      // Optionally call onClose after the operation
      onClose();
    } catch (error) {
      console.error('Error during Rewrite operation:', error);
    } finally {
      setLoading(false); // Stop the loading animation
    }
  };

  // handle onClicks for redact
  const handleReadctClick = async () => {
    try {
      setLoading(true); // Start the loading animation
  
      // Wait for the onRedact function to complete
      await onRedact();
  
      // Optionally call onClose after the operation
      onClose();
    } catch (error) {
      console.error('Error during Redact operation:', error);
    } finally {
      setLoading(false); // Stop the loading animation
    }
  };

  return (
    <>
      <Card shadow="sm" radius="md" withBorder p="xs">
        {loading ? (
          //   <Loader color="grape" size="xs" type="bars" />
          <div
            id="loader"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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
          <div
            style={{
              display: 'flex',
              gap: '16px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'nowrap', alignItems: 'center' }}>
              {/* <img
                src={`chrome-extension://${chrome.runtime.id}/assets/logo.png`}
                alt="Placeholder Logo"
                height="20"
                style={{ marginRight: '8px' }}
              /> */}
              <Text
                size="sm"
                fw={500}
                component="span"
                style={{ color: 'black', cursor: 'pointer', margin: 0 }}
                onClick={handleRewriterClick}
              >
                <BsPen size={12} style={{ marginRight: '4px' }} />
                Rewrite
              </Text>

              <Text
                size="sm"
                fw={500}
                component="span"
                style={{ color: 'black', cursor: 'pointer', margin: 0 }}
                onClick={handleReadctClick}
              >
                <IoMdSync size={16} style={{ marginRight: '4px' }} />
                Redact
              </Text>

              <Text
                size="sm"
                fw={500}
                component="span"
                style={{ color: 'black', cursor: 'pointer', margin: 0 }}
                onClick={onSummarize}
              >
                <MdOutlineSegment size={16} style={{ marginRight: '4px' }} />
                Summarize
              </Text>
            </div>
          </div>
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
