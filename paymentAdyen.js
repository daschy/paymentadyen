//Inspired by https://github.com/hekike/adyen-node/blob/master/lib/HPP.js
'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var binascii = require('binascii');

var HPP = function(config) {

    var options = config || {};

    if (!options.HMACKey) {
        throw new Error('HMAC key is required');
    }

    this._HMACKey = options.HMACKey;
    this._paymentPage = options.paymentPage || 'pay';

    this._url = 'https://live.adyen.com/hpp/' + this._paymentPage + '.shtml?';

    if (options.test === true) {
        this._url = 'https://test.adyen.com/hpp/' + this._paymentPage + '.shtml?';
    }

    this._request = {};
};


HPP.prototype.generateHash = function(options, hmacSecret) {
    var props = _(_.keys(options)).sortBy().value().join(':')
    var values = '';

    _(_.keys(options)).sortBy().each(function(key, i, ar) {
        var value = ('' + options[key]).replace(/\\/g, '\\\\').replace(/:/g, '\\:');
        values += (value + (i < ar.length - 1 ? ':' : ''));
    }).value();

    var hmacText = props + ':' + values;
    console.log('hmacText', hmacText);
    console.log('hmacSecret', hmacSecret);

    var hMacKey = binascii.a2b_hex(hmacSecret);
    var merchantSig = crypto.createHmac('sha256', hMacKey).update(hmacText).digest('base64');
    
   
    return merchantSig;
};

HPP.prototype.generateRequest = function(options, callback) {
    var requestUrl = this._url;
    var _this = this;
    console.log(options);
    // Generate sign hash
    var merchantSig = _this.generateHash(options, _this._HMACKey);

    // Build url
    for (var key in options) {
        if (options.hasOwnProperty(key) && options[key]) {
            requestUrl += key + '=' + encodeURIComponent(options[key]) + '&';
        }
    }

    var testSig = 'sZYP7iQ/42wpP/gUADm8EJNxkubZfu4vp1xxdgYCXaw=';
    console.log('merchantSigTest', merchantSig == testSig, merchantSig, testSig);
    requestUrl += 'merchantSig=' + merchantSig;

    return callback(null, requestUrl, _this._request.merchantReference);
    // });
};

var hppPayment = new HPP({
    test: true,
    // HMACKey: '9473C710E78B7CDBA771EA90E34FCE41F4A4C98773BC2446BB1BBC9B0A3B1339',
    HMACKey: '5F63B5EA8254F784AF7528942BD45AA5BAF2075FB93C4E2AC664D62768F29A2C',
    paymentPage: 'select',
});

var request = {
    merchantAccount: 'StudioKrokBVCOM',
    skinCode: 'T71dPoT8',
    // sessionValidity: '2015-10-12T17:43:51Z',
    sessionValidity:'2015-10-13T17:44:32Z',
    paymentAmount: 199,
    currencyCode: 'EUR',
    merchantReference: 'SKINTEST-1444756424165',
    shipBeforeDate: '2015-10-19',
    shopperLocale: 'en_GB'
};


hppPayment.generateRequest(request, function(err, url, merchantRef) {
    if (err) {
        return console.error(err);
    }
    console.log(url);

});
