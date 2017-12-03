function updateMacList() {
  //remove mac items
  var macList = document.getElementById("mac-list");
  while (macList.firstChild) {
    macList.removeChild(macList.firstChild);
  }

  // request mac addresses
  getRequest("/get-mac-addresses", function(macAddresses) {
    // convert result to JSON
    macAddresses = JSON.parse(macAddresses);

    // add to list
    for (i in macAddresses) {
      var macItem = document.createElement("div");
      macItem.className = "mac-item";

      // add address
      var macItemAddress = document.createElement("div");
      macItemAddress.className = "mac-item-address";
      macItemAddress.appendChild(document.createTextNode(macAddresses[i].address));

      // add online/offline status
      var macItemStatus = document.createElement("div"); 
      var timestamps = macAddresses[i].timestamps;
      if (Date.now() - timestamps[timestamps.length-1] <= 60000) { // check if device has been online in the past minute
        macItemStatus.className = "mac-item-status-online";
      } else {
        macItemStatus.className = "mac-item-status-offline";
      }

      // append HTML
      macItem.appendChild(macItemStatus);
      macItem.appendChild(macItemAddress);
      macList.appendChild(macItem);
    }
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

updateMacList();