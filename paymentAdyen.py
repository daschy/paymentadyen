#!/usr/bin/env python
# -*- coding: UTF-8 -*-
 
import base64
import hmac
import hashlib
import binascii
from collections import OrderedDict
 
def escapeVal(val):
  return val.replace('\\','\\\\').replace(':','\\:')
 
def signParams(parms):
  signing_string = ':'.join(map(escapeVal, parms.keys() + parms.values()))
  hm = hmac.new(hmac_key, signing_string, hashlib.sha256)
  parms['merchantSig'] =  base64.b64encode(hm.digest())
  return parms
 
hmac_key = binascii.a2b_hex("D04380D86318264832E4A6E44A28A03D4E28B3DB18653783D07043F622B4F017")
 
rawparams = {
  'merchantAccount': 'StudioKrokBVCOM',
  'currencyCode': 'EUR',
  'paymentAmount': '199',
  'sessionValidity': '2015-10-14T22:31:06Z',
  'shipBeforeDate': '2015-10-20',
  'shopperLocale': 'en_GB',
  'merchantReference': 'SKINTEST-1435226439255',
  'skinCode': 'T71dPoT8' }
 
params = OrderedDict(sorted(rawparams.items(), key=lambda t: t[0]))
 
# expected merchantSig = 3kf3eQvj08EwsB/Bw7hiILnXAvrgGQq7ldDFMh0RUQk
print signParams(params)
print 'merchantSig', params['merchantSig']