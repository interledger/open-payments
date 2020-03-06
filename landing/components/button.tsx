import * as React from 'react'

type props = {
  onClick?: (event: any) => void
}

const Button: React.FC<props> = (props) => {
  return (
    <button onClick={ props.onClick } className="button min-w-64 py-2 px-4 rounded focus:outline-none border border-primary text-primary hover:bg-primary hover:text-white active:bg-primary">
      { props.children }
    </button>
  )
}

export default Button
