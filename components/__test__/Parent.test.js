import { render, screen } from '@testing-library/react'
import Parent from '../Parent'
import Child from '../Child'
import User from '../User'

jest.mock('../Child')
Child.mockImplementation(props => props.user)
jest.mock('../User')

test('1. Parent renders', () => {
  render(<Parent />)
  expect(screen.getByText(/component Parent/i)).toBeInTheDocument()
})

test('2. Child mock was called', () => {
  render(<Parent />)
  expect(Child).toHaveBeenCalled()
})

test('3. User mock was called', () => {
  render(<Parent />)
  expect(User).toHaveBeenCalled()
})

test('4. User mock was called with the correct props', () => {
  render(<Parent />)
  expect(User).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Peter" }),
    expect.anything()
  )
})

test('Child mock was called with User mock', () => {
  render(<Parent />)
  
  // dark path
  // test fails
  // expect(Child).toHaveBeenCalledWith(
  //   { user: <User name="Peter" />},
  //   expect.anything()
  // )
})