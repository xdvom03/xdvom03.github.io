// some parameters
chaosStep = 0.01; // mask step for Euler method
debugMode = false; // makes the unmask program recreate the mask exactly
signalStrength = 0.005; // roughly the signal-to-noise ratio
useParity = true;
maskWidthMultiplier = 5.12; // matches R exactly

// We add a tiny bit of randomness to the chaotic mask so that it can't be regenerated as a whole
// No need to make this big, because the Lorenz system amplifies tiny changes
randomSize = 0.001; 
if (debugMode) {
  randomSize = 0;
}




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

myLorentz = function(xyz) {
  // Produces the tangent vector for the Lorentz system 
  const sigma = 10;
  const beta = 8/3;
  const rho = 28;
  var x = xyz[0];
  var y = xyz[1];
  var z = xyz[2];
  result = [sigma*(y-x), rho*x - y - x*z, x*y - beta*z + Math.random() * randomSize];
  return (result);
}

decodeLorentz = function(xyz, input_x) {
  const sigma = 10;
  const beta = 8/3;
  const rho = 28;
  var x = xyz[0];
  var y = xyz[1];
  var z = xyz[2];
  if (debugMode) {
    result = [sigma*(y-x), rho*x - y - x*z, x*y - beta*z]; // recreates the original mask exactly (unless random or different starting point)
  } else {
    result = [sigma*(y-x), rho*input_x - y - input_x*z, input_x*y - beta*z];
  }
  return (result);
}



pickChannel = function(i, maxIndex) {
  // given the index as calculated by javascript
  // (four consecutive datapoints per pixel)
  // find the index as calculated by R
  // (first all the red, then all the green...)

  /*
  var channel = i % 4;
  var pixel = Math.floor(i / 4);
  var pixCount = (maxIndex / 4);
  return (channel * pixCount + pixel);
  */
  
  //return ((i + 4) % maxIndex);
  return(i);
}

isValidIndex = function(i) {
  //return(true);
  return(i % 4 != 3);
}