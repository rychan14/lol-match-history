import React from 'react'
import { keyframes } from '@emotion/core'
import styled from '@emotion/styled'
import { Box, th } from '@smooth-ui/core-em'

const blink = keyframes`
  50% {background-color: transparent;} 
`

const Ellipsis = styled('div')`
  background-color: ${th('dark')};
  border-radius: 50%;
  height: 20px;
  width: 20px;
  animation: 1.5s ${blink} infinite;
  &:nth-child(1) {
    animation-delay: 0ms;
  }
  &:nth-child(2) {
    animation-delay: 250ms;
  }
  &:nth-child(3) {
    animation-delay: 500ms;
  }
`

const LoadingEllipsis = () => (
  <Box
    display='flex'
    justifyContent='space-between'
    alignItems='center'
    maxWidth='100px'
  >
    <Ellipsis size='1x' />
    <Ellipsis size='1x' />
    <Ellipsis size='1x' />
  </Box>
)

export default LoadingEllipsis
