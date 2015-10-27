//Inspired by https://github.com/hekike/adyen-node/blob/master/lib/HPP.js
'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var binascii = require('binascii');

var Adyen = function(config) {

    var options = config || {};

    this._paymentPage = options.paymentPage || 'pay';

    this._url = 'https://live.adyen.com/hpp/' + this._paymentPage + '.shtml';

    if (options.test === true) {
        this._url = 'https://test.adyen.com/hpp/' + this._paymentPage + '.shtml';
    }

    this._request = {};
};


Adyen.prototype.generateHash = function(options, hmacSecret) {
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

Adyen.prototype.generateRequest = function(options, merchantSig) {
    var requestUrl = this._url;
    var _this = this;
    // Generate sign hash
    var paramsJson={};
    // Build url params
    for (var key in options) {
        if (options.hasOwnProperty(key) && options[key]) {
            paramsJson[key] = options[key];
        }
    }
    paramsJson['merchantSig'] = merchantSig;
    return {
        url: requestUrl,
        params: paramsJson,
    };
};

module.exports = Adyen;
