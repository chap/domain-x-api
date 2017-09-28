const express = require('express')
const app = express()
const port = process.env.PORT ||3000
const { Resolver } = require('dns');
const resolver = new Resolver();
resolver.setServers(['8.8.8.8']);

app.get('/', function (req, res) {
  var domain = req.query.domain
  if(domain && domain.includes('.')) {
    res.setHeader('Content-Type', 'text/plain')
    // res.send(domain)

    // resolver.resolve4(domain, (err, addresses) => {
    //   if (err) throw err;
    //
    //   console.log(`addresses: ${JSON.stringify(addresses)}`);
    //
    //   addresses.forEach((a) => {
    //     resolver.reverse(a, (err, hostnames) => {
    //       if (err) {
    //         throw err;
    //       }
    //       console.log(`reverse for ${a}: ${JSON.stringify(hostnames)}`);
    //     });
    //   });
    // });
    resolver.resolveAny(domain, (err, records) => {
      response = {}
      response.domain = domain
      if (records.length > 0)
        response.dns_provider = determineDNSProvider(records)
        response.records = records
      res.send(JSON.stringify(response, null, 2))
    });

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
    } else {
      return '?'
    }
  }
}

function findNsRecord(record) {
  return 'nsname' in record
}
