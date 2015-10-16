var Adyen = require('./paymentAdyen.js');
var curl = require('curlrequest');



var paymentInfo = {
    paymentAmount: 199,
    currencyCode: 'EUR',
    shopperLocale: 'en_GB',
    sessionValidity: '2015-10-16T22:31:06Z',
    shipBeforeDate: '2015-10-20',
    merchantReference: 'SKINTEST-1435226439255',
    // shopperEmail: req.user.email,
};


var env = {};
env.adyen = {
    live: false,
    hmacKey: 'FA3356D2DCFB352C634609A0122A9E166BFF0376A08AEBFBCCD7056CA13EC676',
    merchantAccount: 'StudioKrokBVCOM',
    skinCode: 'T71dPoT8',
};

var hppPayment = new Adyen({
    test: (!env.adyen.live ? true : false),
    paymentPage: 'select',
});

var values = {
    currencyCode: paymentInfo.currencyCode,
    merchantAccount: env.adyen.merchantAccount,
    merchantReference: paymentInfo.merchantReference,
    paymentAmount: paymentInfo.paymentAmount,
    sessionValidity: paymentInfo.sessionValidity,
    shipBeforeDate: paymentInfo.shipBeforeDate,
    shopperLocale: paymentInfo.shopperLocale,
    skinCode: env.adyen.skinCode,
    // shopperEmail:paymentInfo.shopperEmail,
};

console.log(values);

var merchantSig = hppPayment.generateHash(values, env.adyen.hmacKey);
var request = hppPayment.generateRequest(values, merchantSig);


var test = {
    merchantSig: 'GQDbqbGrJ2xIZqWmmtMShrU4sRX4Z4IHWod86VW8Vs4=',
};
console.log('HMACKEY', env.adyen.HMACKey);
console.log('requestUrl', request);
console.log('test.merchantSig == merchantSig', test.merchantSig == merchantSig)
console.log('merchantSig', merchantSig);

curl.request({
    method: 'POST',
    url: request.url,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: request.params
}, function(err, parts) {
    parts = parts.split('\r\n');
    // var data = parts.pop()
    //   , head = parts.pop();
    console.log('Error: Invalid Request', (parts + '').indexOf('Invalid Request') > -1);
    console.log('Error: Merchant signature?', (parts + '').indexOf('Error: Merchant signature') > -1);
    console.log('Request valid', (parts + '').indexOf('Choose your Payment Method') > -1);
});
