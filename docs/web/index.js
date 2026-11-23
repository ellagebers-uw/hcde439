/*
    A6
    Ella Gebers
    Reads a capactive sensor to determine the size of a circle on the webpage. 
    If the button is pressed, tells the webpage to change the background color. 
    If the mouse is moved on the webpage, the LED light turns on.

    Code is inspired by the "brightness" and "button" p5-arduino examples. 
    I utilized Claude as a tool to debug my code, as documented on my assignment webpage.
*/

// match the baud rate to the Arduino sketch
const BAUD_RATE = 9600; 
// Declare global variables
let port, connectBtn; 
// buttonState variable
let buttonState = 0;
// capacitive sensor value
let capValue = 0;
// variable for if the led should be on or off
let led = false;
// variable to hold mouse movements
let mouseActive = false;
// variable to hold when the mouse was last active
let lastMouseMove = 0;
// ms of stillness before it counts as "stopped"
const MOUSE_TIMEOUT = 300; 

function setup() {
  // Run the serial setup function
  setupSerial(); 

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
  // Check whether the port is open (see checkPort function below)
  const portIsOpen = checkPort(); 
  // If the port is not open, exit the draw loop
  if (!portIsOpen) return; 

  // Read whatever has arrived since the last frame
  if (port.opened() && port.available() > 0) {
    // read one line from the serial port, up to the newline character
    let line = port.readUntil("\n");
    // check that the line isn't empty
    if (line.length > 0) {
      // remove whitespace, then split the line to read button state and capacitive value
      let parts = line.trim().split(",");
      // only continue if there is exactly two values, ignoring partial/garbled lines
      if (parts.length === 2) {
        // convert the first value to an int, then set the buttonState       
        buttonState = int(parts[0]);
        // convert the second value to an int, the set the capacitive sensor value
        capValue = int(parts[1]);
      }
    }
  }

  //check if the mouse is activly moving
  if (millis() - lastMouseMove > MOUSE_TIMEOUT) {
    mouseActive = false;
  }

  // Change text and colors based on button state.
  // If the mouse is moving
  if(mouseActive){
    // set background color
    background("pink")
    // If the button is not pressed
  } else if (buttonState === 0) {
    // set background color
    background("darkcyan"); 
    // If the button is pressed
  } else if (buttonState === 1) {
    // set background color
    background("lightskyblue"); 
  }

  // Tell the Arduino only when the state changes
  if (mouseActive !== led) {
    // set led to true if mouse is active, false if not active
    led = mouseActive;
    // write 1(mouse active, light should be or), 
    // or 0 (mouse is not active, light should be off)
    // and send it to Arduino
    port.write(led ? 1 : 0);
  }

  // make the circle white
  fill("white")
  // change the size of the circle drawn on screen
  // based on capacitive sensor value
  let size = map(capValue, 0, 255, 20, 300);
  // create circle
  circle(width / 2, height / 2, size);  
}

// function to update mouseActive and lastMouseMove variables
// if the mouse has moved
function mouseMoved() {
  // set mouseActive varable to true
  mouseActive = true;
  // update time since the mouse was last moved
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