var Adyen = require('./paymentAdyen.js');
var curl = require('curlrequest');

var test ={
    merchantSig: 'GQDbqbGrJ2xIZqWmmtMShrU4sRX4Z4IHWod86VW8Vs4=',
};

var hppPayment = new Adyen({
    test: true,
    HMACKey: 'FA3356D2DCFB352C634609A0122A9E166BFF0376A08AEBFBCCD7056CA13EC676',
    paymentPage: 'select',
});

var values = {
    merchantAccount: 'StudioKrokBVCOM',
    skinCode: 'T71dPoT8',
    // sessionValidity: '2015-10-12T17:43:51Z',
    sessionValidity:'2015-11-25T10:31:06Z',
    paymentAmount: 199,
    currencyCode: 'EUR',
    merchantReference: 'SKINTEST-1435226439255',
    shipBeforeDate: '2015-11-01',
    shopperLocale: 'en_GB'
};



console.log(values);
console.log('HMACKEY', hppPayment._HMACKey);
var merchantSig = hppPayment.generateHash(values, hppPayment._HMACKey);
var request = hppPayment.generateRequest(values, merchantSig);
console.log('requestUrl', request);

console.log('test.merchantSig == merchantSig',test.merchantSig == merchantSig)
console.log('merchantSig', merchantSig);

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
    console.log('Request valid', (parts+'').indexOf('Choose your Payment Method') > -1);
});