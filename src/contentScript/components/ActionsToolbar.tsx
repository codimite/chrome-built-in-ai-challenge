import React, { useState } from 'react'
import { Card, Progress, Text, Button, Group, Loader } from '@mantine/core'
import { BsPen } from 'react-icons/bs'
import { IoMdSync } from 'react-icons/io'
import { MdOutlineSegment } from 'react-icons/md'
import '@mantine/core/styles.css'

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
    setLoading(true)
    await onRewrite()

    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 2000)
  }

  // handle onClicks for redact
  const handleReadctClick = async () => {
    setLoading(true)
    await onRedact()

    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 2000)
  }

  return (
    <>
      <Card shadow="sm" radius="md" withBorder p="xs">
        {loading ? (
          <Loader color="grape" size="xs" type="bars" />
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'nowrap', alignItems: 'center' }}>
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
        )}
      </Card>
    </>
  )
}

export default ActionsToolbar
