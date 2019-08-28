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

    this.updateAppContext = () => {
      this.setState({initialized: false});
      fetch('/api/user/state')
          .then(response => response.json())
          .then(data => this.setState({ user: data, initialized: true, error: false }))
          .catch(() => {
            this.setState({error: true, errorCountdown: 3});

            let countdown = setInterval(() => {
              this.setState((state) => ({errorCountdown: (state.errorCountdown - 1)}));

              if( this.state.errorCountdown === 0 ){
                clearInterval(countdown);
                this.updateAppContext();
              }

            }, 1000);
          });
    };

    this.state = {
      initialized:  false,
      setupError: false,
      errorCountdown: 0,
      app_title: "cuddly-memory",
      user: {},
      updateAppContext: this.updateAppContext
    };



  }

  componentDidMount() {
    this.updateAppContext();
  }

  render() {
    const errorText = (this.state.error) ? <p className={"text-center"}>There was an error loading the app.<br/>Trying again in {this.state.errorCountdown} seconds.</p> : null;


    if( ! this.state.initialized ){
      return (
          <div>
            <div className="Loading">
              <CircularProgress size={72} />
            </div>
            {errorText}
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