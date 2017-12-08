function updateMac() {
  var address = document.getElementById("title").innerHTML;

  document.getElementById("refresh").innerHTML = "Retrieving...";

  // remove mac items
  var macList = document.getElementById("mac-list");
  while (macList.firstChild) {
    macList.removeChild(macList.firstChild);
  
  }
  getRequest("/get-mac/" + address, function(data) {
    var timestamps = JSON.parse(data)[0].timestamps;
    console.log(timestamps);

    for (i in timestamps) {
      // add timestamp
      var macItem = document.createElement("div");
      macItem.className = "mac-item";
      macItem.appendChild(document.createTextNode(new Date(timestamps[i])));

      // append to macList
      macList.appendChild(macItem);
    }

    document.getElementById("refresh").innerHTML = "Refresh timestamps";

  });
}

function getRequest(reqName, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', "http://" + window.location.host + reqName, true);
  
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      callback(request.responseText);      
    } else {
      console.log("Request with name " + reqName + " failed!");
    }
  };
  request.onerror = function() {
    console.log("Request with name " + reqName + " failed!");
  };
  
  request.send();
}

updateMac();