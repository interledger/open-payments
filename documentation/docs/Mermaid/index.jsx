import React from "react";
import useThemeContext from '@theme/hooks/useThemeContext';
import MermaidLight from './MermaidLight'
import MermaidDark from './MermaidDark'

export const Mermaid = (props) => {
  const {isDarkTheme} = useThemeContext();
  if (isDarkTheme) return (<MermaidDark chart={props.chart.toString()}/>)
  return (<MermaidLight chart={props.chart}/>)
}
