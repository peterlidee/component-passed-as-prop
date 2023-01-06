import { render, screen } from '@testing-library/react'
import Child from '../Child'

test('It renders Child', () => {
  render(<Child user="somevalue" />)
  expect(screen.getByText(/component Child/i)).toBeInTheDocument()
  expect(screen.getByText(/somevalue/i)).toBeInTheDocument()
})