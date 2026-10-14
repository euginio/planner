import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
   beforeEach(() => {
      localStorage.clear()
   })

   it('creates and opens a plan', () => {
      render(<App />)

      const input = screen.getByRole('textbox', { name: 'New plan name' })
      fireEvent.change(input, { target: { value: 'Today' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
      expect(localStorage.getItem('App.Sheets')).toBe(JSON.stringify(['Today']))

      fireEvent.click(screen.getByRole('button', { name: 'Today' }))
      expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
   })
})
