const express = require('express')
const app = express()
const https = require("https");
const http = require("http");
const port = process.env.PORT ||3000
const { Resolver } = require('dns');
const resolver = new Resolver();
resolver.setServers(['8.8.8.8']);

app.get('/', function (req, res) {
  var domain = req.query.domain
  if(domain && domain.includes('.')) {
    res.setHeader('Content-Type', 'text/plain')

    resolver.resolveAny(domain, (err, records) => {
      response = {}
      response.domain = domain
      response.dns_provider = determineDNSProvider(records)


      var urlHttp = 'http://' + domain
      http.get(urlHttp, httpRes => {
        httpRes.headers.status = httpRes.statusCode
        response.http_response = httpRes.headers


        // var urlHttps = 'https://' + domain
        // https.get(urlHttps, httpsRes => {
        //   httpsRes.headers.status = httpsRes.statusCode
        //   response.https_response = httpsRes.headers


          response.records = records
          res.send(JSON.stringify(response, null, 2))
        // })
      })
    })
  } else {
    res.statusCode = 400
    res.end('Please add ?domain=example.com that includes at least one dot')
  }
})

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!')
})

function determineDNSProvider(records) {
  var nsrecord = records.find(findNsRecord)
  if (nsrecord) {
    var nsname = nsrecord.nsname
    if (nsname.includes('domaincontrol')) {
      return 'GoDaddy'
    } else if (nsname.includes('registrar-servers')) {
      return 'Namecheap'
    } else if (nsname.includes('netsol') || nsname.includes('networksolutions')) {
      return 'Network Solutions'
    } else if (nsname.includes('dynect')) {
      return 'Dyn Managed DNS'
    } else if (nsname.includes('awsdns')) {
      return 'AWS Route53'
    } else if (nsname.includes('cloudflare')) {
      return 'CloudFlare'
    } else if (nsname.includes('zerigo')) {
      return 'Zerigo'
    } else if (nsname.includes('gandi')) {
      return 'Gandi'
    } else if (nsname.includes('dnsimple')) {
      return 'DNSimple'
    } else if (nsname.includes('dnsmadeeasy')) {
      return 'DNS Made Easy'
    } else if (nsname.includes('pointhq')) {
      return 'PointDNS'
    } else if (nsname.includes('hover')) {
      return 'Hover'
    } else if (nsname.includes('googledomains')) {
      return 'Google Domains'
    } else {
      return '?'
    }
  }
}

function findNsRecord(record) {
  return 'nsname' in record
}
