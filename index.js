import React from 'react'
import Sketch from '../../../components/Sketch'
import Canvas from '../../../components/Canvas'

const Demo = () => {
  return <div>Hello, world!</div>
}
const About = () => (
  <p className='major'>
    I'm a musician and programmer.
  </p>
)

export default () => {
  return <Sketch backgroundColor='white' demo={<Demo />} about={<About />} />
}
