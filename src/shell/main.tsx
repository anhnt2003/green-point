import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shell.css'
import { Simulator } from './Simulator'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Simulator />
  </StrictMode>,
)
