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
  if (step == 1) {
    maskEstimate = (drivingData[[step]] + drivingData[[step + 1]]) / 2;
  } else {
    maskEstimate = (drivingData[[step]] + drivingData[[step - 1]]) / 2;
  }
  result = [maskEstimate, 0, 0];
  return (result);
}

// NB: global variable names must not clash between scripts!
var badCanvas = document.getElementById('badCanvas');
var badInput = document.getElementById('badInput');
var badC = badCanvas.getContext('2d');

badInput.onchange = function() {
  speed = 10 // How many rows at a time get uploaded
  var img = new Image();
  img.onload = function() {
    badCanvas.width = this.width;
    badCanvas.height = this.height;
    badC.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);

    var pixelData = badC.getImageData(0, 0, badCanvas.width, badCanvas.height);
    // the driving data is everything but the visibility
    drivingData = (removeAlpha(pixelData.data)).map(x => (x - 128) / maskWidthMultiplier);
    console.log(drivingData);
    var lor = badEuler(badLorentz, badStart, badCanvas.height * badCanvas.width * 4, chaosStep, drivingData); // TBD: Find the right length
    var maskSeries = lor.map((a) => a[0]) // Getting just the X time series
    console.log(maskSeries);
    
    var i = 0;
    // since we have to skip the alpha layer,
    // the indexes in the image and in the mask list
    // start to diverge. thus, we keep them separately.
    var counter = 0;

    // TBD: Assert that the image have no alpha layer?

    console.log("The bad script is running!");
    
    function step() {
      var imgData = badC.createImageData(badCanvas.width, speed);
      for (let j = 0; j < imgData.data.length; j++) {
        index = i * imgData.data.length + j;
        if (index % 4 != 3) {
          signal = pixelData.data[index];
          mask = 128 + maskSeries[counter]*maskWidthMultiplier;
          parity = (useParity & counter % 2 == 1) ? -1 : 1;
          imgData.data[j] = Math.floor((signal - mask) / (parity * signalStrength));
          counter++;
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
    window.requestAnimationFrame(step);
  }
  img.src = URL.createObjectURL(this.files[0]);
}