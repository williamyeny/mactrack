# mactrack

MacTrack is a Raspberry Pi mac address extractor and logger. 
It's designed to secretely and periodically scan the router it is connected to for all connected devices and log the results.
Operators can access the log data in either text or visual form via a web interface.
It also incorporates an accelerometer in case the device is physically tampered with -- when moved, it quits its core processes and alerts the user

## Technical Description
### Hardware

### Software
The software running on the Raspberry Pi Zero W is primarily a Node.js web server and Python script. 

The Node.js web server handles the tracking of mac addresses. It uses an Express backend coupled with NeDB as a database. 
To scan mac addresses, it leverages a node module called node-arp. 
Essentially, it scans the Address Resolution Protocol cache, which holds the mapping to IP addresses and their corresponding mac addresses.
It does this every minute and stores the timestamps for each mac address in NeDB. 
In order to find the IP addresses to scan, it finds the base IP using a module called localIP and scans the range of IPs from 1 to 255.

    function scanArp() {
      var localIpPrefix = localIp.split(".", 3).join(".") + ".";
        for (i = 1; i < 256; i++) {
          // grab mac addresses from 1 - 256
          arp.getMAC(localIpPrefix + i, function(err, mac) { // normally 192.168.1. for home networks
            if (!err) {
                // insert into db
                db.update({
                  address: mac
                }, {
                  $push: {
                    timestamps: Date.now()
                  }
                },{
                  upsert: true // create new entry if does not exist
                });
          }
        });
      }
    }

[You can view the full backend server code here](https://github.com/williamyeny/mactrack/blob/master/index.js).

For the front end, I use EJS as the templating engine and grab data from the backend using a simple API.
It visually updates the frontend by deleting the current list and creating a new one with data retrieved from the API.
[You can view the full frontend code here](https://github.com/williamyeny/mactrack/blob/master/public/js/macList.js)

In order to create the visualization, I used p5.js as the drawing library. 
Then, it was simply a matter of taking the timestamps and doing simple math to determine where to place the blocks indicating an online status.
Since we know the horizontal width of the canvas to be 700 pixels, it should easy to do a 24 hour preview.

    var ms24h = 24 * 60 * 60 * 1000;
    var time24Hours = Date.now() - (ms24h); // the time 24 hours ago
    var points = [];
    p.setup = function() {
      p.createCanvas(700, 63);
      for (i in timestamps) {
        if (timestamps[i] > time24Hours ) { // within 24 hours...
          // console.log("found timestamp: " + timestamps[i]);
          points.push((timestamps[i] - time24Hours)/ms24h * 700);
        }
      }
      ...
    }

I had to optimize the visualization creation to reduce loading times. 
Here, I check if a block is necessary to draw based on if its preceding and following blocks overlap.

      for (i in points) {
        // check if rect should be drawn
        if (i > 0 && i < points.length-1) { // if it's not the first or last point
          if (points[i-1] + 5 <= points[i+1]) { // if the prev and next block overlap
            continue; // don't draw rect
          }
        }
        // draw rect
        p.fill(0, 255, 0);
        p.rect(points[i]- 2.5, 63/2 - 2.5, 5, 5);
      }

[You can view the full visualization code here](https://github.com/williamyeny/mactrack/blob/master/public/js/statusGraph.js)

