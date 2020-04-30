import * as React from 'react'

type props = {
  width ?: string // Allows card's width to be set. Setting w-full will stretch the card to full width of container 
}

const Card: React.FC<props> = (props) => {
  let className = 'h-screen p-16 bg-white elevation-1 rounded md:'
  className += props.width || 'w-card'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Card
