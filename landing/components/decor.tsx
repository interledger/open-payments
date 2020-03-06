import * as React from 'react'

const Decor: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      <div className="transform
        -translate-y-1/2 -translate-x-1/2 sm:-translate-x-10 lg:translate-x-10
        h-1000 w-1000 lg:scale-150 xl:scale-200
        absolute -z-10 bg-cyan-light rounded-full top-0 left-0"/>
      <div className="transform
        translate-y-500 translate-x-10
        h-200 w-200 lg:scale-150 xl:scale-200
        absolute -z-10 bg-orange-light rounded-full top-0 left-0"/>
      <div className="transform
        translate-y-450 -translate-x-6
        h-90 w-90 lg:scale-150 xl:scale-200
        absolute -z-10 border-10 border-red-light rounded-full top-0 right-0"/>
      <div className="transform
        translate-y-600 -translate-x-32
        h-1000 w-1000 lg:scale-150 xl:scale-200
        absolute -z-12 bg-teal-light rounded-full top-0 left-0"/>
      <div className="transform
        translate-y-1400 -translate-x-6
        h-500 w-500 lg:scale-150 xl:scale-200
        absolute -z-10 border-50 border-green-light rounded-full top-0 right-0 sm:left-0"/>
    </div>
  )
}

export default Decor
