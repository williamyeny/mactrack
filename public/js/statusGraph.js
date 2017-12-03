function createGraph(id, timestamps) {
  // console.log('creating new graph with id ' + id + ".");
  new p5( function( p ) {
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

      p.noStroke();
      p.background(0);
      for (i in points) {

        // check to see if creating rect is necessary
        if (i > 0 && i < points.length-1) { // if it's not the first or last point
          if (points[i-1] + 5 <= points[i+1]) { // if the prev and next block overlap
            // console.log("skipping...");
            continue; // don't draw rect
            
          }
        }

        p.fill(0, 255, 0);
        p.rect(points[i]- 2.5, 63/2 - 2.5, 5, 5);
      }
    };
  
    p.draw = function() {};
  }, id);
}