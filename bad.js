// some parameters
badStart = [-13, -14, 47]; // initial point for the chaotic mask

// helper functions

badEuler = function(fun, initial, steps, stepLength, drivingData) {
  // Euler method for vectors (multiple coordinates; the function calculates the vector of the derivatives)
  var output = [];
  var current = initial;
  for (let step = 0; step < steps; step++) {
    output[step] = current;
    current = fun(drivingData, step); 
  }
  return (output);
}

badLorentz = function(drivingData, step) {
  maskEstimate = 0;
  if (step < parityLength) {
    maskEstimate = drivingData.slice(step, step + parityLength).reduce((a,b)=>a+b) / parityLength;
    //maskEstimate = (drivingData[[step]] + drivingData[[step + 1]]) / 2;
  } else {
    maskEstimate = drivingData.slice(step - parityLength, step).reduce((a,b)=>a+b) / parityLength;
    //maskEstimate = (drivingData[[step]] + drivingData[[step - 1]]) / 2;
  }
  result = [maskEstimate, 0, 0];
  return (result);
}

// NB: global variable names must not clash between scripts!
var badCanvas = document.getElementById('badCanvas');
var badInput = document.getElementById('badInput');
var badC = badCanvas.getContext('2d');

function updateBad(imageSource) {
  var img = new Image();
  img.onload = function() {
    badCanvas.width = this.width;
    badCanvas.height = this.height;
    badC.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);

    var pixelData = badC.getImageData(0, 0, badCanvas.width, badCanvas.height);
    var dataLength = badCanvas.width * badCanvas.height * 3;
    // That froofaroo at the beginning
    // is there to convert the uint8bitclampedarray
    // (from reading an image) into a regular array
    // This is necessary because the original array type
    // only admits nonnegative integers!
    var parsedImage = Array.prototype.slice.call(pixelData.data);
    // the driving data does not contain the alpha
    var drivingData = getDrivingData(parsedImage);
    console.log(drivingData);
    var lor = badEuler(badLorentz, badStart, badCanvas.height * badCanvas.width * 3, chaosStep, drivingData); // TBD: Find the right length
    var maskSeries = lor.map((a) => a[0]) // Getting just the X time series
    console.log(maskSeries);
    
    var i = 0; // counter for pixel blocks updated as a whole
    var RGBIndex = 0;
    
    function step() {
    var imgData = badC.createImageData(badCanvas.width, speed);
      for (let j = 0; j < imgData.data.length; j++) {
        // The order of the current channel
        // in whatever ordering we're currently using
        index = i * imgData.data.length + j;

        // The channel index in Javascript's ordering
        var maskIndex = pickMaskIndex(RGBIndex, dataLength);
        if (isValidIndex(index)) {
          signal = parsedImage[index];
          mask = 128 + maskSeries[maskIndex] * maskWidthMultiplier;
          parity = (useParity & parityNegative(RGBIndex)) ? -1 : 1;
          imgData.data[j] = Math.round((signal - mask) / (parity * signalStrength));
          RGBIndex++;
        } else {
          imgData.data[j] = 255;
        }
      }
      badC.putImageData(imgData, 0, i * speed);

      i++;
      if (i * speed < badCanvas.height) {
        window.requestAnimationFrame(step); // starts the function again
      }
    }
    window.requestAnimationFrame(step); // updates the canvas
  }
  img.src = imageSource;
}

badInput.onchange = function() {
  updateBad(URL.createObjectURL(this.files[0]));
}