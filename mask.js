// some parameters
chaosStart = [-13, -14, 47]; // initial point for the chaotic mask
chaosStep = 0.01; // mask step for Euler method
debugMode = false; // if true, writes the generated chaos into a text file and draws its plot
signalStrength = 0.01; // roughly the signal-to-noise ratio
useParity = true;
maskWidthMultiplier = 5;
// We add a tiny bit of randomeness to the chaotic mask so that it can't be regenerated as a whole
// No need to make this big, because the Lorenz system amplifies tiny changes
randomSize = 0.001; 

// helper functions

myEuler = function(fun, initial, steps, stepLength) {
  // Euler method for vectors (multiple coordinates; the function calculates the vector of the derivatives)
  var output = [];
  var current = initial;
  for (let step = 0; step < steps; step++) {
    output[step] = current;

    // now we sum the two arrays
    // if only this could be Lisp...
    // mapcar would do this without the index hack
    current = fun(current).map((x, index) => x * stepLength + current[index]); 
  }
  return (output);
}

myLorentz = function(xyz) {
  const sigma = 10;
  const beta = 8/3;
  const rho = 28;
  var x = xyz[0];
  var y = xyz[1];
  var z = xyz[2];
  result = [sigma*(y-x), rho*x - y - x*z, x*y - beta*z + Math.random() * randomSize];
  return (result);
}

// NB: global variable names must not clash between scripts!
var chaosCanvas = document.getElementById('chaosCanvas');
var chaosInput = document.getElementById('chaosInput');
var chaosC = chaosCanvas.getContext('2d');

chaosInput.onchange = function() {
  speed = 10 // How many rows at a time get uploaded
  var img = new Image();
  img.onload = function() {
    chaosCanvas.width = this.width;
    chaosCanvas.height = this.height;
    chaosC.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);

    var pixelData = chaosC.getImageData(0, 0, chaosCanvas.width, chaosCanvas.height);
    var lor = myEuler(myLorentz, chaosStart, chaosCanvas.height * chaosCanvas.width * 3, chaosStep); // TBD: Find the right length
    var maskSeries = lor.map((a) => a[0]) // Getting just the X time series
    console.log(maskSeries);
    
    var i = 0;
    // since we have to skip the alpha layer,
    // the indexes in the image and in the mask list
    // start to diverge. thus, we keep them separately.
    var counter = 0;

    // TBD: Assert that the image have no alpha layer?

    console.log("The mask script is running!");
    
    function step() {
      var imgData = chaosC.createImageData(chaosCanvas.width, speed);
      for (let j = 0; j < imgData.data.length; j++) {
        index = i * imgData.data.length + j;
        if (index % 4 != 3) {
          signal = pixelData.data[index];
          mask = 128 + maskSeries[counter] * maskWidthMultiplier;
          parity = (useParity & counter % 2 == 1) ? -1 : 1;
          imgData.data[j] = Math.floor(mask + signal * signalStrength * parity);
          counter++;
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
    window.requestAnimationFrame(step);
  }
  img.src = URL.createObjectURL(this.files[0]);
}