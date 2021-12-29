// Copyright 2021 Xsolla Inc. All Rights Reserved.

import { _decorator, Component, Enum} from 'cc';
import { AuthenticationType, XsollaSettings, Xsolla } from 'db://xsolla-commerce-sdk/scripts/Xsolla';
const { ccclass, property, disallowMultiple, type  } = _decorator;
 
@ccclass('XsollaSettingsManager')
@disallowMultiple(true)
export class XsollaSettingsManager extends Component {

    @property({
        displayName: 'Login ID',
        tooltip: 'Login ID in the UUID format from your Publisher Account (required)'
    })
    loginId: string = '026201e3-7e40-11ea-a85b-42010aa80004';

    @property({
        displayName: 'Project ID',
        tooltip: 'Project ID from your Publisher Account (required)'
    })
    projectId: string = '77640';

    @property ({
        displayName: 'Authentication Type',
        tooltip: 'If enabled, OAuth 2.0 protocol will be used in order to authorize the user',
    })
    @type(Enum(AuthenticationType))
    authType: AuthenticationType = AuthenticationType.Oauth2;

    @property ({
        displayName: 'Client ID',
        tooltip: 'Client ID from your Publisher Account',
        visible: function(): boolean {
            return this.authType == AuthenticationType.Oauth2;
        }        
    })
    clientId: number = 57;

    @property ({
        displayName: 'Enable Sandbox',
        tooltip: 'Enable to test the payment process: sandbox-secure.xsolla.com will be used instead of secure.xsolla.com.'
    })
    enableSandbox: boolean = true;

    start() {
        var settings: XsollaSettings = {
            loginId: this.loginId,
            projectId: this.projectId,
            authType: this.authType,
            clientId: this.clientId,
            enableSandbox: this.enableSandbox
        }

        Xsolla.init(settings);
    }
}