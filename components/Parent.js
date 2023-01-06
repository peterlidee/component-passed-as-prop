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