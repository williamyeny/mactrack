var arp = require("node-arp");

var express = require("express");
var app = express();
var port = 4567;

var Datastore = require('nedb');
var db = new Datastore({ filename: "", autoload: true });

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", function(req, res) {
  res.render("index.ejs");
});

app.listen(port, function() { 
  console.log("server started on port " + port);
});

function scanArp() {
  for (i = 1; i < 256; i++) {
    // grab mac addresses from 1 - 256
    arp.getMAC('10.196.11.' + i, function(err, mac) { // normally 192.168.1. for home networks
      if (!err) {
          console.log(mac);
      } else {
        //  console.log("error: " + mac);
      }
    });
  }
}