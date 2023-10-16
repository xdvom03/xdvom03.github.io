var canvas = document.getElementById('cn');
var input = document.getElementById('canvasInput');
var c2d = canvas.getContext('2d');

input.onchange = function() {
  speed = 5 // How many rows at a time get uploaded
  var img = new Image();
  img.onload = function() {
    canvas.width = this.width;
    canvas.height = this.height;
    c2d.drawImage(this, 0, 0);
    URL.revokeObjectURL(this.src);
    c2d.arc(100, 100, 44, 1, 2); // x, y, r, angle1, angle2
    c2d.stroke();

    var pixelData = c2d.getImageData(0, 0, canvas.width, canvas.height)

    console.log(pixelData);
    
    var i = 0;
    function step() {
      console.log(i);
      var imgData = c2d.createImageData(canvas.width, speed);
      for (let j = 0; j < imgData.data.length; j++) {
        index = i * imgData.data.length + j;
        if (index % 4 != 3) {
          imgData.data[j] = 255 - pixelData.data[index];
        } else {
          imgData.data[j] = 255;
        }
      }
      c2d.putImageData(imgData, 0, i * speed);

      i++;
      if (i * canvas.width < pixelData.data.length) {
        window.requestAnimationFrame(step); // starts the function again
      }
    }
    window.requestAnimationFrame(step);
  }
  img.src = URL.createObjectURL(this.files[0]);
}
