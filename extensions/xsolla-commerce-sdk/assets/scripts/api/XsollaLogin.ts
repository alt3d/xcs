// Copyright 2021 Xsolla Inc. All Rights Reserved.

import { sys } from "cc";
import { LoginError, XsollaError } from "../core/XsollaError";
import { XsollaHttpUtil, XsollaRequestContentType } from "../core/XsollaHttpUtil";
import { XsollaUrlBuilder } from "../core/XsollaUrlBuilder";
import { Xsolla, XsollaAuthenticationType } from "../Xsolla";

export class XsollaLogin {

    /**
     * @en
     * Authenticates the user by the username and password specified via the authentication interface.
     * @zh
     * 
     */
    static authByUsernameAndPassword(username:string, password:string, rememberMe:boolean, payload?:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        if(Xsolla.settings.authType == XsollaAuthenticationType.Oauth2) {
            this.authByUsernameAndPasswordOauth(username, password, onComplete, onError);
        }
        else {
            this.authByUsernameAndPasswordJwt(username, password, rememberMe, payload, onComplete, onError);
        }
    }

    private static authByUsernameAndPasswordOauth(username:string, password:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            password: password,
            username: username
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/login/token')
            .addNumberParam('client_id', Xsolla.settings.clientId)
            .addStringParam('scope', 'offline')
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, result => {
            let token: Token = JSON.parse(result);
            onComplete?.(token);
        }, XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    private static authByUsernameAndPasswordJwt(username:string, password:string, rememberMe:boolean, payload?:string, onComplete?:(result:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            password: password,
            remember_me: rememberMe,
            username: username
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/login')
            .addStringParam('projectId', Xsolla.settings.loginId)
            .addStringParam('login_url', 'https://login.xsolla.com/api/blank')
            .addBoolParam('with_logout', true)
            .addStringParam('payload', payload)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, this.handleUrlWithToken(onComplete), XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    /**
     * @en
     * Refreshes the token in case it is expired. Works only when OAuth 2.0 is enabled.
     * @zh
     * 
     */
    static refreshToken(refreshToken:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            client_id: Xsolla.settings.clientId,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            redirect_uri: 'https://login.xsolla.com/api/blank'
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/token').build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.WwwForm, null, result => {
            let token: Token = JSON.parse(result);
            onComplete?.(token);
        }, XsollaError.handleLoginError(onError));
        request.send(XsollaHttpUtil.encodeFormData(body));
    }

    /**
     * @en
     * Exchanges the user authentication code to a valid JWT. Works only when OAuth 2.0 is enabled.
     * @zh
     * 
     */
    static exchangeAuthCode(authCode:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            client_id: Xsolla.settings.clientId,
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: 'https://login.xsolla.com/api/blank'
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/token').build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.WwwForm, null, result => {
            let token: Token = JSON.parse(result);
            onComplete?.(token);
        }, XsollaError.handleLoginError(onError));
        request.send(XsollaHttpUtil.encodeFormData(body));
    }

    /**
     * @en
     * Starts authentication by the user phone number and sends a confirmation code to their phone number.
     * @zh
     * 
     */
    static startAuthByPhoneNumber(phoneNumber:string, payload?:string, state?:string, onComplete?:(operationId:string) => void, onError?:(error:LoginError) => void) {
        if(Xsolla.settings.authType == XsollaAuthenticationType.Oauth2) {
            this.startAuthByPhoneNumberOauth(phoneNumber, state, onComplete, onError);
        }
        else {
            this.startAuthByPhoneNumberJwt(phoneNumber, payload, onComplete, onError);
        }
    }

    private static startAuthByPhoneNumberOauth(phoneNumber:string, state?:string, onComplete?:(operationId:string) => void, onError?:(error:LoginError) => void) {
        let body = {
            phone_number: phoneNumber
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/login/phone/request')
            .addNumberParam('client_id', Xsolla.settings.clientId)
            .addStringParam('response_type', 'code')
            .addStringParam('redirect_uri', 'https://login.xsolla.com/api/blank')
            .addStringParam('state', state)
            .addStringParam('scope', 'offline')
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, result => {
            let authOperationId: AuthOperationId = JSON.parse(result);
            onComplete?.(authOperationId.operation_id);
        }, XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    private static startAuthByPhoneNumberJwt(phoneNumber:string, payload?:string, onComplete?:(operationId:string) => void, onError?:(error:LoginError) => void) {
        let body = {
            phone_number: phoneNumber
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/login/phone/request')
            .addStringParam('projectId', Xsolla.settings.loginId)
            .addStringParam('login_url', 'https://login.xsolla.com/api/blank')
            .addBoolParam('with_logout', true)
            .addStringParam('payload', payload)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, result => {
            let authOperationId: AuthOperationId = JSON.parse(result);
            onComplete?.(authOperationId.operation_id);
        }, XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    /**
     * @en
     * Completes authentication by the user phone number and a confirmation code.
     * @zh
     * 
     */
    static completeAuthByPhoneNumber(confirmationCode:string, operationId:string, phoneNumber:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        if(Xsolla.settings.authType == XsollaAuthenticationType.Oauth2) {
            this.completeAuthByPhoneNumberOauth(confirmationCode, operationId, phoneNumber, onComplete, onError);
        }
        else {
            this.completeAuthByPhoneNumberJwt(confirmationCode, operationId, phoneNumber, onComplete, onError);
        }
    }

    private static completeAuthByPhoneNumberOauth(confirmationCode:string, operationId:string, phoneNumber:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            code: confirmationCode,
            operation_id: operationId,
            phone_number: phoneNumber
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/login/phone/confirm')
            .addNumberParam('client_id', Xsolla.settings.clientId)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, this.handleUrlWithCode(onComplete, onError), XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    private static completeAuthByPhoneNumberJwt(confirmationCode:string, operationId:string, phoneNumber:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            code: confirmationCode,
            operation_id: operationId,
            phone_number: phoneNumber
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/login/phone/confirm')
            .addStringParam('projectId', Xsolla.settings.loginId)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, this.handleUrlWithToken(onComplete), XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    /**
     * @en
     * Starts authentication by the user email address and sends a confirmation code to their email address.
     * @zh
     * 
     */
    static startAuthByEmail(emailAddress:string, payload?:string, state?:string, onComplete?:(operationId:string) => void, onError?:(error:LoginError) => void) {
        if(Xsolla.settings.authType == XsollaAuthenticationType.Oauth2) {
            this.startAuthByEmailOauth(emailAddress, state, onComplete, onError);
        }
        else {
            this.startAuthByEmailJwt(emailAddress, payload, onComplete, onError);
        }
    }

    private static startAuthByEmailOauth(emailAddress:string, state?:string, onComplete?:(operationId:string) => void, onError?:(error:LoginError) => void) {
        let body = {
            email: emailAddress
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/login/email/request')
            .addNumberParam('client_id', Xsolla.settings.clientId)
            .addStringParam('response_type', 'code')
            .addStringParam('redirect_uri', 'https://login.xsolla.com/api/blank')
            .addStringParam('state', state)
            .addStringParam('scope', 'offline')
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, result => {
            let authOperationId: AuthOperationId = JSON.parse(result);
            onComplete?.(authOperationId.operation_id);
        }, XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    private static startAuthByEmailJwt(emailAddress:string, payload?:string, onComplete?:(operationId:string) => void, onError?:(error:LoginError) => void) {
        let body = {
            email: emailAddress
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/login/email/request')
            .addStringParam('projectId', Xsolla.settings.loginId)
            .addStringParam('login_url', 'https://login.xsolla.com/api/blank')
            .addBoolParam('with_logout', true)
            .addStringParam('payload', payload)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, result => {
            let authOperationId: AuthOperationId = JSON.parse(result);
            onComplete?.(authOperationId.operation_id);
        }, XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    /**
     * @en
     * Completes authentication by the user email address and a confirmation code.
     * @zh
     * 
     */
    static completeAuthByEmail(confirmationCode:string, operationId:string, emailAddress:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        if(Xsolla.settings.authType == XsollaAuthenticationType.Oauth2) {
            this.completeAuthByEmailOauth(confirmationCode, operationId, emailAddress, onComplete, onError);
        }
        else {
            this.completeAuthByEmailJwt(confirmationCode, operationId, emailAddress, onComplete, onError);
        }
    }

    private static completeAuthByEmailOauth(confirmationCode:string, operationId:string, emailAddress:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            code: confirmationCode,
            operation_id: operationId,
            email: emailAddress
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/login/email/confirm')
            .addNumberParam('client_id', Xsolla.settings.clientId)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, this.handleUrlWithCode(onComplete, onError), XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    private static completeAuthByEmailJwt(confirmationCode:string, operationId:string, emailAddress:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            code: confirmationCode,
            operation_id: operationId,
            email: emailAddress
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/login/email/confirm')
            .addStringParam('projectId', Xsolla.settings.loginId)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, this.handleUrlWithToken(onComplete), XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    /**
     * @en
     * Authenticates a platform account user via deviceId.
     * @zh
     * 
     */
    static authByDeviceId(deviceName:string, deviceId:string, payload?:string, state?:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        if(Xsolla.settings.authType == XsollaAuthenticationType.Oauth2) {
            this.authByDeviceIdOauth(deviceName, deviceId, state, onComplete, onError);
        }
        else {
            this.authByDeviceIdJwt(deviceName, deviceId, payload, onComplete, onError);
        }
    }

    private static authByDeviceIdOauth(deviceName:string, deviceId:string, state?:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            device: deviceName,
            device_id: deviceId
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/oauth2/login/device/{PlatformName}')
            .setPathParam('PlatformName', sys.platform.toLowerCase())
            .addNumberParam('client_id', Xsolla.settings.clientId)
            .addStringParam('response_type', 'code')
            .addStringParam('redirect_uri', 'https://login.xsolla.com/api/blank')
            .addStringParam('state', state)
            .addStringParam('scope', 'offline')
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, this.handleUrlWithCode(onComplete, onError), XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    private static authByDeviceIdJwt(deviceName:string, deviceId:string, payload?:string, onComplete?:(token:Token) => void, onError?:(error:LoginError) => void) {
        let body = {
            device: deviceName,
            device_id: deviceId
        };

        let url = new XsollaUrlBuilder('https://login.xsolla.com/api/login/device/{PlatformName}')
            .setPathParam('PlatformName', sys.platform.toLowerCase())
            .addStringParam('projectId', Xsolla.settings.loginId)
            .addBoolParam('with_logout', true)
            .addStringParam('payload', payload)
            .build();

        let request = XsollaHttpUtil.createRequest(url, 'POST', XsollaRequestContentType.Json, null, result => {
            let authResult = JSON.parse(result);
            let token: Token = {
                access_token: authResult.token,
                token_type: 'bearer'
            };
            onComplete?.(token);
        }, XsollaError.handleLoginError(onError));
        request.send(JSON.stringify(body));
    }

    private static handleUrlWithToken(onComplete: (token: Token) => void): (result: any) => void {
        return result => {
            let authUrl: AuthUrl = JSON.parse(result);
            let params = XsollaHttpUtil.decodeUrlParams(authUrl.login_url);
            let token: Token = {
                access_token: params['token'],
                token_type: 'bearer'
            };
            onComplete?.(token);
        };
    }

    private static handleUrlWithCode(onComplete: (token: Token) => void, onError?:(error:LoginError) => void): (result: any) => void {
        return result => {
            let authUrl: AuthUrl = JSON.parse(result);
            let params = XsollaHttpUtil.decodeUrlParams(authUrl.login_url);
            this.exchangeAuthCode(params['code'], onComplete, onError);
        };
    }
}

export interface Token {
    access_token: string,
    expires_in?: number,
    refresh_token?: string,
    token_type: string
}

export interface AuthUrl {
    login_url: string
}

export interface AuthOperationId {
    operation_id: string
}

