// Copyright 2021 Xsolla Inc. All Rights Reserved.

import { _decorator, Component, Node, Button, Label } from 'cc';
import { UserDetails, UserDetailsUpdate, XsollaUserAccount } from 'db://xsolla-commerce-sdk/scripts/api/XsollaUserAccount';
import { TokenStorage } from '../Common/TokenStorage';
import { UserAccountItemComponent } from './Misc/UserAccountItemComponent';
import { UIManager, UIScreenType } from './UIManager';
const { ccclass, property } = _decorator;
 
@ccclass('UserAccountManager')
export class UserAccountManager extends Component {

    @property(Button)
    backButton: Button;

    @property(UserAccountItemComponent)
    emailItem: UserAccountItemComponent;

    @property(UserAccountItemComponent)
    usernameItem: UserAccountItemComponent;

    @property(UserAccountItemComponent)
    nicknameItem: UserAccountItemComponent;

    @property(UserAccountItemComponent)
    firstNameItem: UserAccountItemComponent;

    @property(UserAccountItemComponent)
    lastNameItem: UserAccountItemComponent;

    @property(UserAccountItemComponent)
    phoneNumberItem: UserAccountItemComponent;

    start() {

    }

    onEnable() {
        this.refreshUserAccountScreen();
        this.addListeners();
    }

    onDisable() {
        this.removeListeners();
    }

    onBackClicked() {
        UIManager.instance.openScreen(UIScreenType.MainMenu, this.node);
    }

    refreshUserAccountScreen() {
        XsollaUserAccount.getUserDetails(TokenStorage.token.access_token, userDetails => {
            this.fillUserAccountItems(userDetails);
        }, err => {
            console.log(err);
            UIManager.instance.openErrorScreen(err.description);
        });
    }

    updateUserAccountData(userDetailsUpdate: UserDetailsUpdate) {
        XsollaUserAccount.updateUserDetails(TokenStorage.token.access_token, userDetailsUpdate, userDetails => {
            this.fillUserAccountItems(userDetails);
        }, err => {
            console.log(err);
            UIManager.instance.openErrorScreen(err.description);
            this.refreshUserAccountScreen();
        });
    }

    fillUserAccountItems(userDetails: UserDetails) {
        this.emailItem.setValue(userDetails.email);
        this.usernameItem.setValue(userDetails.username);
        this.nicknameItem.setValue(userDetails.nickname);
        this.firstNameItem.setValue(userDetails.first_name);
        this.lastNameItem.setValue(userDetails.last_name);
        this.phoneNumberItem.setValue(userDetails.phone);
    }

    onNicknameEdited(value: string) {
        let userDetailsUpdate: UserDetailsUpdate = {
            nickname: value
        }
        this.updateUserAccountData(userDetailsUpdate);
    }

    onFirstNameEdited(value: string) {
        let userDetailsUpdate: UserDetailsUpdate = {
            first_name: value
        }
        this.updateUserAccountData(userDetailsUpdate);
    }

    onLastNameEdited(value: string) {
        let userDetailsUpdate: UserDetailsUpdate = {
            last_name: value
        }
        this.updateUserAccountData(userDetailsUpdate);
    }

    onPhoneNumberEdited(value: string) {
        XsollaUserAccount.updateUserPhoneNumber(TokenStorage.token.access_token, value, () => {
            this.phoneNumberItem.setValue(value);
        }, err => {
            console.log(err);
            UIManager.instance.openErrorScreen(err.description);
            this.refreshUserAccountScreen();
        });
    }

    addListeners () {
        this.backButton.node.on(Button.EventType.CLICK, this.onBackClicked, this);
        this.nicknameItem.node.on(UserAccountItemComponent.ITEM_EDIT, this.onNicknameEdited, this);
        this.firstNameItem.node.on(UserAccountItemComponent.ITEM_EDIT, this.onFirstNameEdited, this);
        this.lastNameItem.node.on(UserAccountItemComponent.ITEM_EDIT, this.onLastNameEdited, this);
        this.phoneNumberItem.node.on(UserAccountItemComponent.ITEM_EDIT, this.onPhoneNumberEdited, this);
    }

    removeListeners () {
        this.backButton.node.off(Button.EventType.CLICK, this.onBackClicked, this);
        this.nicknameItem.node.off(UserAccountItemComponent.ITEM_EDIT, this.onNicknameEdited, this);
        this.firstNameItem.node.off(UserAccountItemComponent.ITEM_EDIT, this.onFirstNameEdited, this);
        this.lastNameItem.node.off(UserAccountItemComponent.ITEM_EDIT, this.onLastNameEdited, this);
        this.phoneNumberItem.node.off(UserAccountItemComponent.ITEM_EDIT, this.onPhoneNumberEdited, this);
    }
}
