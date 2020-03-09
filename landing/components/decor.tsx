import * as React from 'react'

const Decor: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      <div className="transform
        translate-y-decory translate-x-decorx
        h-decor w-decor
        absolute -z-10 bg-orange-other rounded-full top-0 right-0"/>
      <div className="transform
        translate-y-decory1 translate-x-decorx1
        h-decor1 w-decor1
        absolute -z-10 bg-teal-light rounded-full top-0 right-0 md:left-0"/>
      <div className="transform
        translate-y-decory2 translate-x-decorx2
        h-decor2 w-decor2
        absolute -z-10 bg-purple-light rounded-full top-0 right-0"/>
    </div>
  )
}

export default Decor
