// some parameters
unmaskStart = [-13, -14, 47]; // initial point for the chaotic mask

function getDrivingData(imageData) {
  console.log("BEG drivingData");
  var rgbData = imageData.filter((value, i) => (isValidIndex(i))); // remove alpha
  // The map just matches array lengths
  var reorderedData = rgbData.map(x => 0);
  var dataLength = rgbData.length;
  for (let i = 0; i < dataLength; i++) {
    maskIndex = pickMaskIndex(i, dataLength);
    reorderedData[maskIndex] = rgbData[i];
  }
  var drivingData = reorderedData.map(x => (x - 128) / maskWidthMultiplier);

  console.log(imageData);
  console.log(rgbData);
  console.log(reorderedData);
  console.log(drivingData);

  console.log("END drivingData");
  return(drivingData);
}





// NB: global variable names must not clash between scripts!
var unmaskCanvas = document.getElementById('unmaskCanvas');
var unmaskInput = document.getElementById('unmaskInput');
var unmaskC = unmaskCanvas.getContext('2d');

function updateUnmask(imageSource) {
  var img = new Image();
  img.onload = function() {
    unmaskCanvas.width = this.width;
    unmaskCanvas.height = this.height;
    unmaskC.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);

    var pixelData = unmaskC.getImageData(0, 0, unmaskCanvas.width, unmaskCanvas.height);
    var dataLength = unmaskCanvas.width * unmaskCanvas.height * 3;
    // That froofaroo at the beginning
    // is there to convert the uint8bitclampedarray
    // (from reading an image) into a regular array
    // This is necessary because the original array type
    // only admits nonnegative integers!
    var parsedImage = Array.prototype.slice.call(pixelData.data);
    // the driving data does not contain the alpha
    var drivingData = getDrivingData(parsedImage);
    //console.log("driving data:");
    //console.log(parsedImage);
    //console.log(drivingData);
    var lor = decodeEuler(decodeLorentz, unmaskStart, unmaskCanvas.height * unmaskCanvas.width * 3, chaosStep, drivingData);
    var maskSeries = lor.map((a) => a[0]) // Getting just the X time series
    console.log(maskSeries);
    
    var i = 0; // counter for pixel blocks updated as a whole
    var RGBIndex = 0;

    function step() {
      var imgData = unmaskC.createImageData(unmaskCanvas.width, speed);
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
      unmaskC.putImageData(imgData, 0, i * speed);

      i++;
      if (i * speed < unmaskCanvas.height) {
        window.requestAnimationFrame(step); // starts the function again
      }
    }
    window.requestAnimationFrame(step); // updates the canvas
  }
  img.src = imageSource;
}

unmaskInput.onchange = function() {
  updateUnmask(URL.createObjectURL(this.files[0]));
}