// Copyright 2021 Xsolla Inc. All Rights Reserved.

import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('UIManager')
export class UIManager extends Component {

    @property(Node)
    startingScreen: Node;

    @property(Node)
    basicAuth: Node;

    @property(Node)
    mainMenu: Node;

    start() {
        this.startingScreen.active = true;
    }

    openStartingScreen(currentScreen:Node) {
        currentScreen.active = false;
        this.startingScreen.active = true;
    }

    openBasicAuth(currentScreen:Node) {
        currentScreen.active = false;
        this.basicAuth.active = true;
    }

    openMainMenu(currentScreen:Node) {
        currentScreen.active = false;
        this.mainMenu.active = true;
    }
}