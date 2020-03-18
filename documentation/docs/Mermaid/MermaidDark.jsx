import React from "react";
import mermaid from "mermaid";

const config = {
  theme: 'dark',
  startOnLoad:true,
  sequence:{
    diagramMarginX:50,
    diagramMarginY:10,
    actorMargin:50,
    width:150,
    height:65,
    boxMargin:10,
    boxTextMargin:5,
    noteMargin:10,
    messageMargin:35,
    mirrorActors:true,
    bottomMarginAdj:1,
    useMaxWidth:true,
    rightAngles:false,
    showSequenceNumbers:false,
  },
}

export default class MermaidDark extends React.Component {
  componentDidMount() {
    mermaid.initialize(config)
    mermaid.contentLoaded();
  }
  render() {
    return <div className="mermaid">{this.props.chart}</div>;
  }
}
