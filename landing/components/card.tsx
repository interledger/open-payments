import * as React from 'react'

type props = {
  width ?: string // Allows card's width to be set. Setting w-full will stretch the card to full width of container 
}

const Card: React.FC<props> = (props) => {
  let className = 'p-4 bg-surface-elevation-1 elevation-1 rounded text-on-surface sm:max-w-full md:'
  className += props.width || 'w-card'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Card
