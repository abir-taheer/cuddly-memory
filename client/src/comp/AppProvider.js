import React from 'react';

// RMWC Circular Progress
import {CircularProgress} from "@rmwc/circular-progress";
import '@rmwc/circular-progress/circular-progress.css';

export const AppContext = React.createContext({initialized: false});


export class AppProvider extends React.Component {
  constructor(props) {

    super(props);

    this.state = {
      initialized:  false,
      state: {}
    };

  }

  componentDidMount() {
    fetch('/api/state')
        .then(response => response.json())
        .then(data => {
          this.setState({ state: data });
          this.setState({initialized: true})
        });
  }

  render() {

    if( ! this.state.initialized ){
      return (
          <div className="Loading">
            <CircularProgress size={72} />
          </div>
      )
    }

    return (
        <AppContext.Provider value={this.state}>
          {this.props.children}
        </AppContext.Provider>
    );
  }
}