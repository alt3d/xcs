// Copyright 2021 Xsolla Inc. All Rights Reserved.

export class XsollaUrlBuilder {
    private _url: string;
    private _parameters = {};
    private _pathParameters = {};

    constructor(url:string) {
        this._url = url;
    }

    build() : string {

        for (var key in this._pathParameters) {
            let paramPlaceholder = '{' + key + '}';
            if(this._url.includes(paramPlaceholder))
            {
                this._url = this._url.replace(paramPlaceholder, this._pathParameters[key]);
            }
        }

        var queryParamsStr: string = '';
        for (var key in this._parameters) {
            queryParamsStr += queryParamsStr ? '&' : '?';
            queryParamsStr += key + '=' + encodeURIComponent(this._parameters[key]);
        }
        return this._url + queryParamsStr;
    }

    setPathParam(paramName:string, paramValue:string) : XsollaUrlBuilder {
        this._pathParameters[paramName] = paramValue;
        return this;
    }

    addStringParam(paramName:string, paramValue:string, ignoreEmpty:boolean = true) : XsollaUrlBuilder {
        if (ignoreEmpty && !paramValue) {
            return this;
        }
        this._parameters[paramName] = paramValue;
        return this;
    }

    addArrayParam(paramName:string, paramValueArray:Array<string>, ignoreEmpty:boolean = true, asOneParam:boolean = false) : XsollaUrlBuilder {
        if (ignoreEmpty && paramValueArray.length == 0)
        {
            return this;
        }
    
        if (asOneParam)
        {
            let additionalFieldsString:string = paramValueArray.join(',');
            additionalFieldsString = additionalFieldsString.substring(0, additionalFieldsString.length - 2);
            this.addStringParam(paramName, additionalFieldsString, ignoreEmpty);
        }
        else
        {
            for (var param in paramValueArray)
            {
                this.addStringParam(paramName, param, ignoreEmpty);
            }
        }
    
        return this;
    }

    addNumberParam(paramName:string, paramValue:number) : XsollaUrlBuilder {
        this._parameters[paramName] = paramValue.toString();
        return this;
    }

    addBoolParam(paramName:string, paramValue:boolean, asNumber:boolean = true) : XsollaUrlBuilder {
        if (asNumber) {
            this._parameters[paramName] = paramValue ? '1' : '0'
        }
        else {
            this._parameters[paramName] = paramValue ? 'true' : 'false'
        }
        return this;
    }
}