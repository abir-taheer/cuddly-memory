import React from 'react';

// RMWC Circular Progress
import {CircularProgress} from "@rmwc/circular-progress";
import '@rmwc/circular-progress/circular-progress.css';

import {ThemeProvider} from  "@rmwc/theme";
import '@material/theme/dist/mdc.theme.css';

export const AppContext = React.createContext({initialized: false});


export class AppProvider extends React.Component {
  constructor(props) {

    super(props);

    this.state = {
      initialized:  false,
      app_title: "cuddly-memory",
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
          <ThemeProvider options={{
            primary: '#5d1049',
            secondary: '#fa3336',
            error: '#b00020',
            background: '#fff',
            surface: '#fff',
            onPrimary: 'rgba(255, 255, 255, 1)',
            onSecondary: 'rgba(255, 255, 255, 1)',
            onSurface: 'rgba(0, 0, 0, 0.87)',
            onError: '#fff',
            textPrimaryOnBackground: 'rgba(0, 0, 0, 0.87)',
            textSecondaryOnBackground: 'rgba(0, 0, 0, 0.54)',
            textHintOnBackground: 'rgba(0, 0, 0, 0.38)',
            textDisabledOnBackground: 'rgba(0, 0, 0, 0.38)',
            textIconOnBackground: 'rgba(0, 0, 0, 0.38)',
            textPrimaryOnLight: 'rgba(0, 0, 0, 0.87)',
            textSecondaryOnLight: 'rgba(0, 0, 0, 0.54)',
            textHintOnLight: 'rgba(0, 0, 0, 0.38)',
            textDisabledOnLight: 'rgba(0, 0, 0, 0.38)',
            textIconOnLight: 'rgba(0, 0, 0, 0.38)',
            textPrimaryOnDark: 'white',
            textSecondaryOnDark: 'rgba(255, 255, 255, 0.7)',
            textHintOnDark: 'rgba(255, 255, 255, 0.5)',
            textDisabledOnDark: 'rgba(255, 255, 255, 0.5)',
            textIconOnDark: 'rgba(255, 255, 255, 0.5)'
          }}>
            {this.props.children}
          </ThemeProvider >
        </AppContext.Provider>
    );
  }
}