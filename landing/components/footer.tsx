import * as React from 'react'

type props = {
  
}

const Footer: React.FC<props> = (props) => {
  return (
    <div className="bg-primary w-full h-200">
      {props.children}
    </div>
  )
}

export default Footer
