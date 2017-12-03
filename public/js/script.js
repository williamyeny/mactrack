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
    for (m in macAddresses) {
      var div = document.createElement("div");
      div.className = "mac-item";
      div.innerHTML = macAddresses[m].address;
      macList.appendChild(div);  
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