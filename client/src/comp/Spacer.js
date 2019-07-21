import React from 'react';

export class Spacer extends React.Component {
  constructor(props){
    super(props);
    this.styles = {
      width: (this.props.width || "0px"),
      height: (this.props.height || "0px")
    }
  }

  render() {
    return (
        <div style={this.styles}/>
    )
  }
}