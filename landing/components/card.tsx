import * as React from 'react'

type props = {
  width ?: string // Allows card's width to be set. Setting w-full will stretch the card to full width of container 
  children ?: any
}

const Card: React.FC<props> = (props) => {
  let className = 'h-screen p-16 bg-white shadow-sm rounded md:'
  className += props.width || 'w-card'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Card
