let { promisify } = require('util')
let form = require('vuejs-form').default

let {
    reverse,
    lookup,
    resolve,
    resolve4,
    resolve6,
    resolveNs,
    resolveMx,
    resolveTxt,
    resolveSrv,
    resolveCname
} = require('dns')



const DEFAULT = {
    search: form({
        ip: null,
        url: null,
        ipv4: null,
        ipv6: null,
        host: null,
    }).rules({
        ip: 'ip|required',
        url: 'url|required',
        ipv4: 'ipv4|required',
        ipv6: 'ipv6|required',
        host: ['host', 'required']
    }),

    domain_name_records: form({
        // dns.resolve
        types: null,

        // dns.resolve4
        ipv4Addresses: null,

        // dns.resolve6
        ipv6Addresses: null,

        // dns.resolveCname
        cNameRecords: null,

        // dns.resolveMx
        mailExchangeRecords: null,

        // dns.resolveNaptr
        regularExpressionRecords: null,

        // dns.resolveNs
        nameServerRecords: null,

        // dns.resolveSoa
        hostSpecifiedStartOfAuthorityRecord: null,

        // dns.resolveSrv
        hostServiceRecords: null,

        // dns.resolvePtr
        hostPointerRecords: null,

        // dns.resolveTxt
        hostTextQueryRecords: null,
    }),

    resolved: form({
        domains: null,
        // dns.getServers
        currentServerIpAddresses: null,
        // dns.lookupService
        lookedUpServicesWithIpHostAndPort: null,
    }),
    lookup: promisify(lookup),
    reverse: promisify(reverse)
}

/*
 * Extend form to augment dns search check and validations. Nothing fancy, just some simple helpers
 * to check what has and has not been validated yet.
 */
form().macro('check', function (value, rule) {
    let rules = {
        ...this.validator().rules,
        host: ({ value }) => /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(value)
    }

    return rules[rule]({ value })
})

function DomainNamePhoneBook(hostOrIpAddress = '127.0.0.1') {

    this.searching = false
    this.lookup = DEFAULT.lookup

    this.reverse = DEFAULT.reverse
    this.resolved = DEFAULT.resolved
    this.domain_name_records = DEFAULT.domain_name_records

    this.search = DEFAULT.search

    this.search.validator().extend({
        host: [
            ':attribute didnt work properly',
            ({ value }) =>  /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(value) === true
        ]
    })

    this.find = (hostOrIpAddress = '127.0.0.1') => {
        this.search.ip = this.search.check(hostOrIpAddress, 'ip') ? hostOrIpAddress : null
        this.search.url = this.search.check(hostOrIpAddress, 'url') ? hostOrIpAddress : null
        this.search.ipv4 = this.search.check(hostOrIpAddress, 'ipv4') ? hostOrIpAddress : null
        this.search.ipv6 = this.search.check(hostOrIpAddress, 'ipv6') ? hostOrIpAddress : null
        this.search.host = this.search.check(hostOrIpAddress, 'host') ? hostOrIpAddress : null
    }

    this.find(hostOrIpAddress)
    this.ip()
    this.host()
    this.getIp = promisify(this.ip)
    this.getHost = promisify(this.host)
}


DomainNamePhoneBook.prototype.host = function () {
    if (this.search.has('host')) {
        return this.search.host
    }

    if (this.search.has('ip')) {
        return this.search.lookupHostViaIpAddress(this.search.ip)
    }

    if (this.search.has('url')) {
        return require('url').parse(this.search.url).host
    }
}

DomainNamePhoneBook.prototype.ip = function () {
    if (this.search.has('ip')) {
        return this.search.ip
    }
    if (this.search.has('url')) {
        return this.lookupIpAddressViaHost(require('url').parse(this.search.url).host)
    }
    if (this.search.has('host')) {
        return this.lookupIpAddressViaHost(this.search.host)
    }
}

DomainNamePhoneBook.prototype.busy = function () {
    return this.searching
}


DomainNamePhoneBook.prototype.lookupIpAddressViaHost = function (host) {
    if (this.search.check(host, 'host')) {
        this.searching = true

        return this.lookup(host)

         if (this.search.check(address, 'ip')) {
             this.search.ip = address
         }
         if (this.search.check(address, 'ipv4')) {
             this.search.ipv4 = address
         }
         if (this.search.check(address, 'ipv6')) {
             this.search.ipv6 = address
         }
         if (this.search.check(host, 'host')) {
             this.search.host = host
         }

         this.search.validate()
         this.searching = false

         return this.search.ip
    } else {
        return console.error(`No ip address found host found in DomainNamePhoneBook based on host name: ${host}`)
    }
}


DomainNamePhoneBook.prototype.lookupHostViaIpAddress = function (ip) {
    if (this.search.check(ip, 'ip')) {
        this.searching = true

        return this.reverse(ip).then(context => {
            this.search.ip = ip
            this.search.host = context.domain

            this.searching = false
            return this.search.host
        }).catch(console.error)
    } else {
        return console.error({
            ip,
            message: `${ip}: failed ip address validation rule`,
        })
    }
}

module.exports = { DomainNamePhoneBook }