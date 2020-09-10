### simply@node-dns (Domain Name Phone Book Service)

---

##### [Node Core DNS Module](https://nodejs.org/api/dns.html)

---

#### Get Ip Address From Host or Url
```javascript
let { DomainNamePhoneBook } = require('simply.node-dns')

let DNS = new DomainNamePhoneBook('google.com')

DNS.getIp().then(({ address, family }) => console.log({ 
    ip: address,
    ipFamily: family // 4 or 6
}))

DNS.getHost().then(({ domain }) => console.log({ domain }))
```


#### Get Host from Ipv4 or Ipv6 Address
```javascript 
let { DomainNamePhoneBook } = require('simply.node-dns')

let DNS = new DomainNamePhoneBook('140.82.114.4')

DNS.getHost().then(({ domain }) => console.log({ 
    domain
}))
```

#### When one is resolved, so is the other
```javascript
let { DomainNamePhoneBook } = require('simply.node-dns')

let DNS = new DomainNamePhoneBook('140.82.114.4')

DNS.getHost().then(({ domain }) => console.log({ 
    domain
}))

DNS.ip() // 140.82.114.4
DNS.host() // github.com
```

