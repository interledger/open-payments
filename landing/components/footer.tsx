import * as React from 'react'

type props = {
  bg?: string
  children?: any
}

const Footer: React.FC<props> = (props) => {
  return (
    <footer className={`bg-${props.bg || 'primary'} w-full p-16`}>
      {props.children}
    </footer>
  )
}

export default Footer
