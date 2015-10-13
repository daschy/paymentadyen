//Inspired by https://github.com/hekike/adyen-node/blob/master/lib/HPP.js
'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var binascii = require('binascii');
var curl = require('curlrequest');

var HPP = function(config) {

    var options = config || {};

    if (!options.HMACKey) {
        throw new Error('HMAC key is required');
    }

    this._HMACKey = options.HMACKey;
    this._paymentPage = options.paymentPage || 'pay';

    this._url = 'https://live.adyen.com/hpp/' + this._paymentPage + '.shtml';

    if (options.test === true) {
        this._url = 'https://test.adyen.com/hpp/' + this._paymentPage + '.shtml';
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
    var hMacKey = binascii.a2b_hex(hmacSecret);
    var merchantSig = crypto.createHmac('sha256', hMacKey).update(hmacText).digest('base64');
    return merchantSig;
};

HPP.prototype.generateRequest = function(options, merchantSig) {
    var requestUrl = this._url;
    var _this = this;
    // Generate sign hash
    // var merchantSig = _this.generateHash(options, _this._HMACKey);
    var params = '';
    // Build url
    for (var key in options) {
        if (options.hasOwnProperty(key) && options[key]) {
            params += key + '=' + encodeURIComponent(options[key]) + '&';
        }
    }
    params += 'merchantSig=' + merchantSig;
    return {url: requestUrl,
        params: params,
    };
    // });
};





var test ={
    merchantSig: '3kf3eQvj08EwsB/Bw7hiILnXAvrgGQq7ldDFMh0RUQk=',
};

var hppPayment = new HPP({
    test: true,
    HMACKey: 'D04380D86318264832E4A6E44A28A03D4E28B3DB18653783D07043F622B4F017',
    paymentPage: 'select',
});

var values = {
    merchantAccount: 'StudioKrokBVCOM',
    skinCode: 'T71dPoT8',
    // sessionValidity: '2015-10-12T17:43:51Z',
    sessionValidity:'2015-10-13T22:31:06Z',
    paymentAmount: 199,
    currencyCode: 'EUR',
    merchantReference: 'SKINTEST-1435226439255',
    shipBeforeDate: '2015-10-20',
    shopperLocale: 'en_GB'
};

console.log(values);
console.log('HMACKEY', hppPayment._HMACKey);
var calcMerchSig = hppPayment.generateHash(values, hppPayment._HMACKey);
console.log('test.merchantSig == calcMerchSig',test.merchantSig == calcMerchSig)
console.log('calcMerchSig', calcMerchSig);

var request = hppPayment.generateRequest(values, calcMerchSig);
console.log('requestUrl', request);


curl.request({
    method:'POST',
    url: request.url,
    headers:{
        'Content-Type':'application/x-www-form-urlencoded',
    },
    data:request.params
}, function (err, parts) {
    parts = parts.split('\r\n');
    // var data = parts.pop()
    //   , head = parts.pop();
    console.log('Error: Invalid Request', (parts+'').indexOf('Invalid Request')>-1);
    console.log('Error: Merchant signature?', (parts+'').indexOf('Error: Merchant signature')>-1);

});




