import React from "react";
import mermaid from "mermaid";

var config = {
  themeCSS: `
  .actor {
    stroke: #CCCCFF;
    fill: #ECECFF;
  }
  
  text.actor {
    fill: black;
    stroke: none;
  }
  
  .actor-line {
    stroke: grey;
  }
  
  .messageLine0 {
    stroke-width: 1.5;
    stroke-dasharray: '2 2';
    stroke: #333;
  }
  
  .messageLine1 {
    stroke-width: 1.5;
    stroke-dasharray: '2 2';
    stroke: #333;
  }
  
  #arrowhead {
    fill: #333;
  }
  
  .sequenceNumber {
    fill: white;
  }
  
  #sequencenumber {
    fill: #333;
  }
  
  #crosshead path {
    fill: #333 !important;
    stroke: #333 !important;
  }
  
  .messageText {
    fill: #333;
    stroke: none;
  }
  
  .labelBox {
    stroke: #CCCCFF;
    fill: whitelabelBoxBkgColor;
  }
  
  .labelText {
    fill: black;
    stroke: none;
  }
  
  .loopText {
    fill: black;
    stroke: none;
  }
  
  .loopLine {
    stroke-width: 2;
    stroke-dasharray: '2 2';
    stroke: #CCCCFF;
  }
  
  .note {
    //stroke: #decc93;
    stroke: #aaaa33;
    fill: #fff5ad;
  }
  
  .noteText {
    fill: black;
    stroke: none;
    font-family: 'trebuchet ms', verdana, arial;
    font-family: var(--mermaid-font-family);
    font-size: 14px;
  }
  
  .activation0 {
    fill: #f4f4f4;
    stroke: #666;
  }
  
  .activation1 {
    fill: #f4f4f4;
    stroke: #666;
  }
  
  .activation2 {
    fill: #f4f4f4;
    stroke: #666;
  }
  
  @media (prefers-color-scheme: dark) {
    .actor {
      stroke: #81B1DB;
      fill: #BDD5EA;
    }
    
    text.actor {
      fill: black;
      stroke: none;
    }
    
    .actor-line {
      stroke: lightgrey;
    }
    
    .messageLine0 {
      stroke-width: 1.5;
      stroke-dasharray: '2 2';
      stroke: lightgrey;
    }
    
    .messageLine1 {
      stroke-width: 1.5;
      stroke-dasharray: '2 2';
      stroke: lightgrey;
    }
    
    #arrowhead {
      fill: lightgrey;
    }
    
    .sequenceNumber {
      fill: white;
    }
    
    #sequencenumber {
      fill: lightgrey;
    }
    
    #crosshead path {
      fill: lightgrey !important;
      stroke: lightgrey !important;
    }
    
    .messageText {
      fill: lightgrey;
      stroke: none;
    }
    
    .labelBox {
      stroke: #81B1DB;
      fill: #BDD5EA;
    }
    
    .labelText {
      fill: #323D47;
      stroke: none;
    }
    
    .loopText {
      fill: lightgrey;
      stroke: none;
    }
    
    .loopLine {
      stroke-width: 2;
      stroke-dasharray: '2 2';
      stroke: #81B1DB;
    }
    
    .note {
      //stroke: #decc93;
      stroke: rgba(255, 255, 255, 0.25);
      fill: #fff5ad;
    }
    
    .noteText {
      fill: black;
      stroke: none;
      font-family: 'trebuchet ms', verdana, arial;
      font-family: var(--mermaid-font-family);
      font-size: 14px;
    }
    
    .activation0 {
      fill: #f4f4f4;
      stroke: #666;
    }
    
    .activation1 {
      fill: #f4f4f4;
      stroke: #666;
    }
    
    .activation2 {
      fill: #f4f4f4;
      stroke: #666;
    }
  }
  `,
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
mermaid.initialize(config)

export class Mermaid extends React.Component {
  componentDidMount() {
    mermaid.contentLoaded();
  }
  render() {
    return <div className="mermaid">{this.props.chart}</div>;
  }
}
