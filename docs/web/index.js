const BAUD_RATE = 9600; // This should match the baud rate in your Arduino sketch

let port, connectBtn; // Declare global variables
let buttonState = 0;
let capValue = 0; // already 0-255 from the Arduino
let led = false;
let mouseActive = false;
let lastMouseMove = 0;
const MOUSE_TIMEOUT = 300; // ms of stillness before it counts as "stopped"

function setup() {
  setupSerial(); // Run our serial setup function (below)

  // Create a canvas that is the size of our browser window.
  // windowWidth and windowHeight are p5 variables
  createCanvas(windowWidth, windowHeight);

  // p5 text settings. BOLD and CENTER are constants provided by p5.
  // See the "Typography" section in the p5 reference: https://p5js.org/reference/
  textFont("system-ui", 50);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
}

function draw() {
  const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
  if (!portIsOpen) return; // If the port is not open, exit the draw loop

  // Read whatever has arrived since the last frame
  if (port.opened() && port.available() > 0) {
    let line = port.readUntil("\n");
    if (line.length > 0) {
      let parts = line.trim().split(",");
      if (parts.length === 2) {          // ignore partial/garbled lines
        buttonState = int(parts[0]);
        capValue = int(parts[1]);
      }
    }
  }

  if (millis() - lastMouseMove > MOUSE_TIMEOUT) {
    mouseActive = false;
  }

  // Change text and colors based on button state. In p5, you can set colors
  // using standard CSS color names as well as many other color formats.
  if(MouseActive){
    background("pink")
  } else if (buttonState === 0) {
    // If the button is not pressed
    background("darkcyan"); // Background color
  } else if (buttonState === 1) {
    background("lightskyblue"); // Background color
  }

  // Tell the Arduino only when the state changes
  if (mouseActive !== led) {
    led = mouseActive;
    port.write(led ? 1 : 0);
  }

  // change the size of the circle drawn on screen
  fill("white")
  let size = map(capValue, 0, 255, 20, 300);
  circle(width / 2, height / 2, size);  
}

function mouseMoved() {
  mouseActive = true;
  lastMouseMove = millis();
}

// Three helper functions for managing the serial connection.

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    // If there are ports we've used, open the first one
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(5, 5); // Position the button in the top left of the screen.
  connectBtn.mouseClicked(onConnectButtonClicked); // When the button is clicked, run the onConnectButtonClicked function
}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to gray
    background("gray");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }
}