import React from 'react';

// RMWC Drawer
import { Drawer,DrawerHeader, DrawerTitle, DrawerSubtitle, DrawerContent } from "@rmwc/drawer";
import '@material/drawer/dist/mdc.drawer.css';

// RMWC TopAppBar
import {SimpleTopAppBar, TopAppBarFixedAdjust} from '@rmwc/top-app-bar';
import '@material/top-app-bar/dist/mdc.top-app-bar.css';

// RMWC List
import {List, ListItem} from "@rmwc/list";
import '@material/list/dist/mdc.list.css';

// React Router Links for Navigation
import {Link} from "react-router-dom";

// State from Provider
import {AppContext} from "./AppProvider";


export class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {DrawerIsOpen: false};
        this.toggleDrawer = this.toggleDrawer.bind(this);
    }

    toggleDrawer(status = ! this.state.DrawerIsOpen ) {
        this.setState({
            DrawerIsOpen: status
        });
    }

    render () {
        return (
            <div>
                <Drawer modal open={this.state.DrawerIsOpen} onClose={() => this.toggleDrawer(false)}>
                    <DrawerHeader>
                        <DrawerTitle>DrawerHeader</DrawerTitle>
                        <DrawerSubtitle>Subtitle</DrawerSubtitle>
                    </DrawerHeader>
                    <DrawerContent>
                        <List>
                            {/*LogIn Button*/}
                            <AppContext.Consumer>
                                {(context) => {
                                    return ( ! context.state.signed_in) ?
                                        (<Link to="/login">
                                            <ListItem>Log In</ListItem>
                                        </Link>) :
                                        null;
                                }}
                            </AppContext.Consumer>
                            <Link to="/">
                                <ListItem>
                                    Home
                                </ListItem>
                            </Link>

                            {/*LogOut Button*/}
                            <AppContext.Consumer>
                                {(context) => {
                                    function logOut() {
                                        fetch("/api/auth/logout")
                                            .then(response => response.json())
                                            .then(() => {
                                                context.updateState();
                                            });
                                    }
                                    return (context.state.signed_in) ?
                                        (<div>
                                            <ListItem onClick={logOut}>Log Out</ListItem>
                                        </div>) :
                                        null;
                                }}
                            </AppContext.Consumer>
                        </List>
                    </DrawerContent>
                </Drawer>

                <AppContext.Consumer>
                    {
                        (context) => {
                            return (
                                <SimpleTopAppBar
                                    title={context.app_title}
                                        navigationIcon={{ onClick: () => this.toggleDrawer() }}
                                />
                            )
                        }
                    }
                </AppContext.Consumer>
                <TopAppBarFixedAdjust />
            </div>
        );
    }
}