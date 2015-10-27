var Adyen = require('./paymentAdyen.js');
var curl = require('curlrequest');

var env = {};
env.adyen = {
    live: false,
    hmacKey: 'FA3356D2DCFB352C634609A0122A9E166BFF0376A08AEBFBCCD7056CA13EC676',
    merchantAccount: 'StudioKrokBVCOM',
    skinCode: 'T71dPoT8',
};

var paymentInfo = {
    paymentAmount: 199,
    currencyCode: 'EUR',
    shopperLocale: 'en_GB',
    // sessionValidity: '2015-10-34T22:31:06Z',
    sessionValidity: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    shipBeforeDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    merchantReference: 'SKINTEST-1435226439255/:\/12',
    shopperEmail: 'milo@pippo.com',
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
    // // shopperEmail:paymentInfo.shopperEmail,
    shopperEmail: 'GRIMDC-grimtwin@hotmail.com',
    // authResult:'AUTHORISED',
    paymentMethod: 'mc',
    pspReference: '8514454253865259',
    shopperLocale: 'en_GB',
    skinCode: 'T71dPoT8'
};


var merchantSig = hppPayment.generateHash(values, env.adyen.hmacKey);
var request = hppPayment.generateRequest(values, merchantSig);


var test = {
    merchantSig: 'GQDbqbGrJ2xIZqWmmtMShrU4sRX4Z4IHWod86VW8Vs4=',
};
console.log(values);
console.log('HMACKEY', env.adyen.hmacKey);
console.log('requestUrl', request);
console.log('test.merchantSig == merchantSig', test.merchantSig == merchantSig)
console.log('merchantSig', merchantSig);

var params = '';
for (var key in request.params) {
    if (request.params.hasOwnProperty(key) && request.params[key]) {
        params += key + '=' + encodeURIComponent(request.params[key]) + '&';
    }
}
params += 'merchantSig=' + encodeURIComponent(merchantSig);
console.log(params);

curl.request({
    method: 'POST',
    url: request.url,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: params
}, function(err, parts) {
    parts = parts.split('\r\n');
    // var data = parts.pop()
    //   , head = parts.pop();
    console.log('Error: Invalid Request', (parts + '').indexOf('Invalid Request') > -1);
    console.log('Error: Merchant signature?', (parts + '').indexOf('Error: Merchant signature') > -1);
    console.log('Request valid', (parts + '').indexOf('Choose your Payment Method') > -1);
});
