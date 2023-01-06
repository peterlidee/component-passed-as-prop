# How to test a component passed as prop with Jest

`React` components can be passed as props. But, they are tricky to test. In this article I will explain how to test components passed as props. Let's start with a simple example.

## Example

We have 3 components: `Parent`, `Child` and `User`. These examples are available on [github](https://github.com/peterlidee/component-passed-as-prop) in the [components folder](https://github.com/peterlidee/component-passed-as-prop/tree/main/components).

```jsx
// components/User.js

export default function User({ name }){
  return(
    <>
      <div>component User</div>
      <div>name: {name}</div>
    </>
  )
}
```

```jsx
// components/Child.js

export default function Child(props){
  return(
    <>
      <div>component Child</div>
      {props.user}
    </>
  )
}
```

```jsx
// components/Parent.js

import Child from './Child'
import User from './User'

export default function Parent(){
  const user = <User name="Peter" />
  return(
    <>
      <div>component Parent</div>
      <Child user={user} />
    </>
  )
}
```

As you can see, the `Parent` renders `Child` and passes to `Child` the `User` component via the `user` prop. `Child` then renders `User` by calling it: `{props.user}`.

The result is:

```
component Parent
component Child
component User
name: Peter
```

## On a sidenote

To setup `Jest` testing in `Next` I followed the steps in the [documentation](https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler). Then I added some [customizations](https://dev.to/peterlidee/3-tips-for-setting-up-jest-and-rtl-for-nextjs-5dle):

- auto include `jest-dom` in every test
- auto clear all mocks
- added eslint for `react-testing-library`


## What do we want to test?

We want to run a test on the `Parent.js` file because that is where we pass the `User` component as a prop to `Child` component.

Here is a quick look at the `Parent` component again:

```jsx
// components/Parent.js

import Child from './Child'
import User from './User'

export default function Parent(){
  const user = <User name="Peter" />
  return(
    <>
      <div>component Parent</div>
      <Child user={user} />
    </>
  )
}
```

And here is a list of the things we are going to test:

1. `Parent` renders
2. `Child` mock got called
3. `User` mock got called
4. `User` mock got called with prop name
5. `Child` mock got called with `User` mock as prop

### 1. Parent renders

We test if the `Parent` renders by testing if the text `component Parent` is in the *screen*.

```jsx
// components/__test__/Parent.test.js

import { render, screen } from '@testing-library/react'
import Parent from '../Parent'

test('1. Parent renders', () => {
  render(<Parent />)
  expect(screen.getByText(/component Parent/i)).toBeInTheDocument()
})
```

### 2. Child mock got called

Next we want to test `Child`. This is a unit test, we are testing the `Parent` component. We don't want to test `Child` component so we mock `Child` and then test if the `Child mock` was called.

```jsx
// components/__test__/Parent.test.js

import { render, screen } from '@testing-library/react'
import Parent from '../Parent'
import Child from '../Child'

jest.mock('../Child')

test('2. Child mock was called', () => {
  render(<Parent />)
  expect(Child).toHaveBeenCalled()
})
```
We imported `Child`, did an automatic mock on it: `jest.mock('../Child')` and test if the mock was called.

### 3. User mock got called

Before we continue let's take a closer look at the `Child` component.

```jsx
// components/Child.js

export default function Child(props){
  return(
    <>
      <div>component Child</div>
      {props.user}
    </>
  )
}
```

Our functional component `Child` takes as it's argument an object: props. The props object has a property: user. The value of this user property is the functional component `User`.

```jsx
<Child user={<User name="Peter" />} />
// equals
{Child({ user: <User name="Peter" />})}
```

`Parent` renders `Child` and `Child` renders `User`. `Child` renders `User` by returning `{props.user}`. This calls the value of props.user: it calls the functional component `User`.

But, we mocked `Child`:
```jsx
jest.mock('../Child')
```

`Child` now no longer refers to the component but to a mocking function: `jest.fn()`. This `Child` mock doesn't return anything (it returns undefined). 

This means our `Child` mock won't render `User` anymore. In our `Child` component, we return `User`: `{props.user}`. In our `Child` mock, we don't return anything. By mocking `Child` we stopped rendering `User` and that is a problem because we want to test if `User` was called.

Let's test this:

```jsx
// test fails
test('3. User mock was called', () => {
  render(<Parent />)
  expect(User).toHaveBeenCalled()
})
```

As expect, this test fails. By mocking `Child`, `User` was no longer rendered or called. The problem is that `User` is no longer called by the `Child` mock. 

The solution is to call or return `User` from the `Child` mock. To return something from a mock we can use `.mockImplementation`. What do we return? `props.user` because that is where `User` was passed.

```jsx
// mock Child
jest.mock('../Child')
// return props.user from Child mock
Child.mockImplementation(props => props.user)
```
Here is the entire test (it passes now).

```jsx
// components/__test__/Parent.test.js

import { render, screen } from '@testing-library/react'
import Parent from '../Parent'
import Child from '../Child'
import User from '../User'

jest.mock('../Child')
jest.mock('../User')
Child.mockImplementation(props => props.user)

// test 1
// test 2

// passes
test('3. User mock was called', () => {
  render(<Parent />)
  expect(User).toHaveBeenCalled()
})
```
And that is all, we now have succesfully tested that both `Child` and `User` mocks were called.

### 4. User mock got called with prop name

In our example, we call `User` with the prop `name="Peter"`. A fixed value, not usefull to test. But this is just a simple example and I want to demonstrate how to test this prop.

```jsx
// components/__test__/Parent.test.js

// test passes
test('4. User mock was called with the correct props', () => {
  render(<Parent />)
  expect(User).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Peter" }),
    expect.anything()
  )
})
```

### 5. Child mock got called with User mock as prop

Think about this. How do we test if the `User` mock was passed as a prop to the `Child` mock? Stop reading and really think about it.

...

Did you get it? It's a trick question. We already have. We proved `User` mock was passed because:

```jsx
// passed
expect(User).toHaveBeenCalled()
```
On a sidenote: There is a dark path here. Look at this test:

```jsx
// fails
test('Child mock was called with User mock', () => {
  render(<Parent />)
  expect(Child).toHaveBeenCalledWith(
    { user: <User name="Peter" />},
    expect.anything()
  )
})
```
This test fails and this is what our `Jest` terminal says:

```
expect(jest.fn()).toHaveBeenCalledWith(...expected)

  - Expected
  + Received

  - {"user": <User name="Peter" />},
  + {"user": <User name="Peter" />},
    {},
```
I'm not 100% sure about this but I think you cannot test if `Child` was called with `User` as a prop using `.toHaveBeenCalledWith()`. It could be a referential inequality thing or something else.

The point I'm trying to make here is that using `.toHaveBeenCalledWith()` is not a valid option here.

## Summary

Components can take other components as props. This can make testing tricky.

You can solve this problem by letting your component mocks return the *propped* component. By returning the *propped* component it renders (gets called) and becomes available for testing.

The *propped* component having been called proves that it was correctly passed.