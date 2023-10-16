// some parameters
unmaskStart = [-13, -14, 47]; // initial point for the chaotic mask

// helper functions

decodeEuler = function(fun, initial, steps, stepLength, drivingData) {
  // Euler method for vectors (multiple coordinates; the function calculates the vector of the derivatives)
  var output = [];
  var current = initial;
  for (let step = 0; step < steps; step++) {
    output[step] = current;

    // now we sum the two arrays
    // if only this could be Lisp...
    // mapcar would do this without the index hack
    current = fun(current, drivingData[step]).map((x, index) => x * stepLength + current[index]); 
  }
  return (output);
}

decodeLorentz = function(xyz, input_x) {
  const sigma = 10;
  const beta = 8/3;
  const rho = 28;
  var x = xyz[0];
  var y = xyz[1];
  var z = xyz[2];
  result = [sigma*(y-x), rho*input_x - y - input_x*z, input_x*y - beta*z];
  //result = [sigma*(y-x), rho*x - y - x*z, x*y - beta*z];
  return (result);
}

removeAlpha = function(data) {
  // That froofaroo at the beginning
  // is there to convert the uint8bitclampedarray
  // (from reading an image) into a regular array
  return Array.prototype.slice.call(data.filter((value, index) => (index % 4 != 3)));
}







// NB: global variable names must not clash between scripts!
var unmaskCanvas = document.getElementById('unmaskCanvas');
var unmaskInput = document.getElementById('unmaskInput');
var unmaskC = unmaskCanvas.getContext('2d');

unmaskInput.onchange = function() {
  speed = 10 // How many rows at a time get uploaded
  var img = new Image();
  img.onload = function() {
    unmaskCanvas.width = this.width;
    unmaskCanvas.height = this.height;
    unmaskC.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);

    var pixelData = unmaskC.getImageData(0, 0, unmaskCanvas.width, unmaskCanvas.height);
    // the driving data is everything but the visibility
    drivingData = (removeAlpha(pixelData.data)).map(x => (x - 128) / maskWidthMultiplier);
    console.log(drivingData);
    var lor = decodeEuler(decodeLorentz, unmaskStart, unmaskCanvas.height * unmaskCanvas.width * 4, chaosStep, drivingData); // TBD: Find the right length
    var maskSeries = lor.map((a) => a[0]) // Getting just the X time series
    console.log(maskSeries);
    
    var i = 0;
    // since we have to skip the alpha layer,
    // the indexes in the image and in the mask list
    // start to diverge. thus, we keep them separately.
    var counter = 0;

    // TBD: Assert that the image have no alpha layer?

    console.log("The unmask script is running!");
    
    function step() {
      var imgData = unmaskC.createImageData(unmaskCanvas.width, speed);
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
      unmaskC.putImageData(imgData, 0, i * speed);

      i++;
      if (i * speed < unmaskCanvas.height) {
        window.requestAnimationFrame(step); // starts the function again
      }
    }
    window.requestAnimationFrame(step);
  }
  img.src = URL.createObjectURL(this.files[0]);
}