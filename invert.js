var inverseCanvas = document.getElementById('inverseCanvas');
var inverseInput = document.getElementById('inverseInput');
var invC = inverseCanvas.getContext('2d');

inverseInput.onchange = function() {
  speed = 10 // How many rows at a time get uploaded
  var img = new Image();
  img.onload = function() {
    inverseCanvas.width = this.width;
    inverseCanvas.height = this.height;
    invC.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);
    //invC.arc(100, 100, 44, 1, 2); // x, y, r, angle1, angle2
    //invC.stroke();

    var pixelData = invC.getImageData(0, 0, inverseCanvas.width, inverseCanvas.height)

    console.log(pixelData);
    
    var i = 0;
    function step() {
      console.log("The inversing script is running!")
      var imgData = invC.createImageData(inverseCanvas.width, speed);
      for (let j = 0; j < imgData.data.length; j++) {
        index = i * imgData.data.length + j;
        if (index % 4 != 3) {
          imgData.data[j] = 255 - pixelData.data[index];
        } else {
          imgData.data[j] = 255;
        }
      }
      invC.putImageData(imgData, 0, i * speed);

      i++;
      if (i * speed < inverseCanvas.height) {
        window.requestAnimationFrame(step); // starts the function again
      }
    }
    window.requestAnimationFrame(step);
  }
  img.src = URL.createObjectURL(this.files[0]);
}
