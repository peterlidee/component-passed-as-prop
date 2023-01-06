import { render, screen } from '@testing-library/react'
import User from '../User'

test('User component renders', () => {
  render(<User name="aaa" />)
  expect(screen.getByText(/component User/i)).toBeInTheDocument()
  expect(screen.getByText(/aaa/i)).toBeInTheDocument()
})