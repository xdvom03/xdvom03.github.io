chaosStart = [-13, -14, 47]; // initial point for the chaotic mask


// NB: global variable names must not clash between scripts!
var chaosCanvas = document.getElementById('chaosCanvas');
var chaosInput = document.getElementById('chaosInput');
var chaosC = chaosCanvas.getContext('2d');

chaosInput.onchange = function() {
  speed = 8 // How many rows at a time get uploaded
  var img = new Image();
  img.onload = function() {
    chaosCanvas.width = this.width;
    chaosCanvas.height = this.height;
    chaosC.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);

    var pixelData = chaosC.getImageData(0, 0, chaosCanvas.width, chaosCanvas.height);
    
    var dataLength = chaosCanvas.width * chaosCanvas.height * 4;
    var parsedImage = pixelData.data;
    var lor = myEuler(myLorentz, chaosStart, chaosCanvas.height * chaosCanvas.width * 4, chaosStep);
    var maskSeries = lor.map((a) => a[0]); // Just the X time series
    console.log(maskSeries);
    
    var i = 0; // counter for pixel blocks updated as a whole
    maskCounter = 0; // counter for the mask series (since sometimes we skip using it)
    
    function step() {
      var imgData = chaosC.createImageData(chaosCanvas.width, speed);
      for (let j = 0; j < imgData.data.length; j++) {
        // The order of the current channel
        // in whatever ordering we're currently using
        index = i * imgData.data.length + j;

        // The channel index in Javascript's ordering
        jsIndex = pickChannel(index, dataLength);

        if (isValidIndex(jsIndex)) {
          signal = parsedImage[jsIndex];
          mask = 128 + maskSeries[maskCounter] * maskWidthMultiplier;
          parity = (useParity & maskCounter % 2 == 0) ? -1 : 1;
          imgData.data[j] = Math.round(mask + (signal * signalStrength * parity));
          maskCounter++;
        } else {
          imgData.data[j] = 255;
        }
      }
      chaosC.putImageData(imgData, 0, i * speed);

      i++;
      if (i * speed < chaosCanvas.height) {
        window.requestAnimationFrame(step); // starts the function again
      }
    }
    window.requestAnimationFrame(step); // updates the canvas
  }
  img.src = URL.createObjectURL(this.files[0]);
}