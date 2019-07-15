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
                            <Link to="/">
                                <ListItem>Home</ListItem>
                            </Link>
                        </List>
                    </DrawerContent>
                </Drawer>

                <SimpleTopAppBar
                    title="cuddly-memory"
                    navigationIcon={{ onClick: () => this.toggleDrawer() }}
                />
                <TopAppBarFixedAdjust />
            </div>
        );
    }
}