import { setTimeout } from "timers";

var arp = require("node-arp");
var localip = require('local-ip'); // module for checking IP
var localIp = ""; // stores the local IP
var scanInterval = 60000; // delay between scans in ms

var express = require("express");
var app = express();
var port = 4567;

var Datastore = require('nedb');
var db = new Datastore({ filename: "macs.db", autoload: true });

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", function(req, res) {
  res.render("index.ejs");
  scanArp();
});

app.get("/get-mac-addresses", function (req, res) {

});

function scanArp() {
  if (localIp == "") { // if local IP is not found yet...
    console.log("[Error] Unable to scan ARP table; local IP not found yet");
    return;
  }

  var localIpPrefix = localIp.split(".", 3).join(".") + "."; // get first 3 numbers of IP, e.g. 10.196.1, changes with each router
  console.log("Local IP prefix: " + localIpPrefix);

  for (i = 1; i < 256; i++) {
    // grab mac addresses from 1 - 256
    arp.getMAC(localIpPrefix + i, function(err, mac) { // normally 192.168.1. for home networks
      if (!err {
          console.log(mac);
          // insert into db
          db.insert({[mac]: Date.now()});

          // persist to disk
          db.persistence.compactDatafile;
      } else {
        // console.log("error: " + mac);
      }
    });
  }
    
}

// get local ip for this machine
localip("wlan0", function(err, res1) { // wlan0 is the wifi module name on Linux
  if (err) { 
    localip("Wi-Fi", function(err, res2) { // try Windows wifi name if error
      if (!err) {
        localIp = res2;
      } else {
        console.log("[Error] Local IP unable to be found");
      }
    });
  } else {
    localIp = res1;
  }
});

//start scan
setInterval(function() {
  scanArp();
}, scanInterval);

app.listen(port, function() { 
  console.log("server started on port " + port);
});
