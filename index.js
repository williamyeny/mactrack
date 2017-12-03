var arp = require('node-arp');

console.log("test");

for (i = 1; i < 256; i++) {
  arp.getMAC('10.191.80.' + i, function(err, mac) {
     if (!err) {
         console.log(mac);
     }
  });
}
