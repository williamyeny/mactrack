# mactrack

![device photo](https://i.imgur.com/YcGjg9K.png)

MacTrack is a Raspberry Pi mac address extractor and logger. 
It's designed to secretely and periodically scan the router it is connected to for all connected devices and log the results.
Operators can access the log data in either text or visual form via a web interface.
It also incorporates an accelerometer in case the device is physically tampered with -- when moved, it quits its core processes and alerts the user.

## Technical Description
### Hardware
An MMA8452Q accelerometer is connected to the Raspberry Pi over an I2C wiring (Fritzing was not cooperating -- hopefully this is acceptable):

![wiring](https://i.imgur.com/E9DGD1K.png)

This allows the acceleration from all three axes to be read and interpreted via a Python library explained below in the software section. Using I2C was extremely convenient since there were only two other wires besides the power wires, saving on space and making soldering easier.

I initially thought about adding more sensors -- however, I felt like using anything larger than the small accelerometer chip may not have fit into the compact enclosure, which would detract from this device's theme of stealth. Also, adding additional buttons or lights would also make this device less inconspicuous, which is why I chose to omit these components in the final design.

![Hardware photo](https://i.imgur.com/URDrGuc.jpg)

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

Here's a quick look into the database of mac addresses after a few days of periodic scanning:

![database](https://i.imgur.com/STw0s5G.png)

[You can view the full backend server code here](https://github.com/williamyeny/mactrack/blob/master/index.js).

For the front end, I use EJS as the templating engine and grab data from the backend using a simple API.
It visually updates the frontend by deleting the current list and creating a new one with data retrieved from the API. The design/aesthetic of the actual webpage will be discussed in the Design/Form section.
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

For reading the accelerometer, I used a Python library made for the specific accelerometer model. Then, I combined the three axes' data to get the overall acceleration. It was a bit trickier to get the script to quit Node.js, but I eventually found a way using some rudimentary Linux knowledge:

    # get ID of node.js process
    nodePid = check_output(["pidof","node"])
    ...
    # kill node.js process
    os.kill(nodePid, signal.SIGTERM)

[You can view the full Python code here](https://github.com/williamyeny/mactrack/blob/master/accel.py)

## Design and Form

### Physical

Since this device is designed to do secret operations, the design should reflect that. The enclosure is designed to be as inconspicuous as possible, in terms of size, color and graphics.

At first, I drafted a few enclosures to be 3D printed, but I realized that the smallest and most polished-looking enclosure was the enclosure that came with the kit. However, the bright red bottom was a problem -- it stood out too much and definitely drew attention. Therefore, I headed over to the Arts Annex to paint the bottom white to make the entire enclosure white. I considered painting it full black, but I imagined sticking the device on a wall, and walls are usually white. Plus, black definitely seems more sinister compared to an innocent white. 

For a final touch, I added a faux "OIT" sticker. This serves a dual purpose -- to cover up the Raspberry Pi logo on the enclosure and to instill a false sense of security. I came up with this idea after walking around in my dorm and noticed the OIT wireless access point boxes at various outlets and realized that no one questioned if these boxes are actually from OIT, simply because they had a sticker that said "OIT" on it. Therefore, I figured if I replicated the sticker on my device, no one would really question it even if they did stumble upon it.

### Virtual

From the start, I wanted my virtual interface to be a clear contrast to my physical interface. Since the theme of this device is under security or penetration testing, I wanted my virtual interface to be somewhat of a parody of the "hacker" aesthetic.

![web interface](https://i.imgur.com/YL21oew.png)

The main colors of a generic "hacker" aesthetic is pure black and white with a neon green. I based this around society's interpretation of how hackers work, with scrolling green text among a harsh black theme. Here, I made sure to highlight the harshness by having pure white on top of pure black and sharp edges on thin borders, as opposed to modern themes' rounded borders and softer colors. I also decided to use pure green (0, 255, 0) as a functional part of my interface -- it signifies if a mac address is "online", which makes sense. Another choice I made was the font; I initially had the usual Helvetica/sans-serif but I ditched it in favor of a monospaced "typewriter" font, which is yet another cliche in hacker software depictions.

## Self-Evaluation / Reflection

Overall, I'm very proud of my project. I not only worked with tools I was familiar with, but also stepped out of my comfort zone to discover new technologies. This project was a result of many hours of typing code (sometimes until the sun came up, whoops) and critical design decisions, so I'm happy to see it working perfectly. Plus, the subject of security interests me greatly, so I was very excited to work on it!

The things I'm most proud of is the web interface -- the design was carefully thought out and the technology behind it took all of my cumulative web development knowledge. However, a close second is the hardware integration. Having never touched hardware interfacing with a Raspberry Pi, it took a lot of research and trial and error to finally have it working, but I'm proud of the resulting clean code and wiring.

There are absolutely things I would improve on, given more time. First of all, the detailed logs in text form is a bit unrefined. I would first format the logs to a more readable format (unlike the huge load of information presented to the user) and have it so it would tell the periods of when the device was online (e.g. 12:00 - 7:30), rather than if the device was online at the minute.

Second of all, I would improve the visualization. Right now, it's only giving a simple 24 hour preview. However, I would like it to extend past that by having the user be able to specify the length of the period (e.g. 48 hours or 6 weeks). I would also like for the user to be able to hover over the visualization and get information like the time at the place where the cursor is hovering over.

Finally, I would've liked to add some sort of removable adhesive on the bottom of the device to make it easier to stick on the wall or ceiling, for example. Right now, it just has its rubber feet, which is OK for the floor or a table, but it definitely looks much more sketchy plopped down on the floor. Having some sort of attachment method would make the device much more flexible in its positioning.


