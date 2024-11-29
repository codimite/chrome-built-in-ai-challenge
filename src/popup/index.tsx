import React from 'react'
import ReactDOM from 'react-dom/client'
import { Popup } from './Popup'
import './index.css'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <Popup />
    </MantineProvider>
  </React.StrictMode>,
)
