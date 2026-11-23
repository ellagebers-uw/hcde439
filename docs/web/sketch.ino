/*
    A6
    Ella Gebers
    Reads a capactive sensor to determine the size of a circle on the webpage. 
    If the button is pressed, tells the webpage to change the background color. 
    If the mouse is moved on the webpage, the LED light turns on.

    Code for calibrating the system is from "Calibration" Ardiuno built in examples,
    which is Public Domain. The capacitor code was made based on 11/3/26 in
    class examples.
*/

// Capacitive Sensor library
#include <CapacitiveSensor.h>
// set the button to pin 7
const int BUTTON_PIN = 7;
// set the button to pin 11
const int LED_PIN = 11;
// Set up the Capacitive sensor with a send and recieve pin
// first param is send, second is receive
CapacitiveSensor   cs_s2_r4 = CapacitiveSensor(2,4);
// minimum sensor value
long minVal = 100000;
// maximum sensor value
long maxVal = 0;
// smoothing variable to hold decimals
float smoothed = 0;
// The capacitive sensor value
int sensorScaled = 0;

void setup() {
  // initialize serial communications
  Serial.begin(9600);    
  // set the timeout for parseInt
  Serial.setTimeout(10); 
  // set LED_PIN to an output
  pinMode(LED_PIN, OUTPUT);
  // set BUTTON_PIN to an Input   
  pinMode(BUTTON_PIN, INPUT); 
  // record when callibrating begins
  unsigned long start = millis();
  // calibrate during the first five seconds
  while (millis() - start < 5000) {
    // read the capacitor:
    long csValue = cs_s2_r4.capacitiveSensor(30);
    if (csValue < 0) continue;
    // record the maximum sensor value
    if (csValue > maxVal) {
      // sets the maxVal if there is a new max
      maxVal = csValue;
    }  
    // record the minimum sensor value
    if (csValue < minVal) {
    // sets the minVal is there is a new min
      minVal = csValue;
    }  
  }
  // set smoothed value to where the untouched sensor reads
  smoothed = minVal;
}

void loop() {
  long csReading = cs_s2_r4.capacitiveSensor(30); 
  // in case the sensor value is outside the range seen during calibration
  if (csReading >= 0) {
    csReading = constrain (csReading, minVal, maxVal);
    //smooth the data
    smoothed = 0.9 * smoothed + 0.1 * csReading;
    // apply the calibration to the sensor reading
  }
 
  sensorScaled = map ((long)smoothed, minVal, maxVal, 0, 255);
  // read the button value and print it to serial
  Serial.print(digitalRead(BUTTON_PIN));
  // add a comma to the serial line
  Serial.print(",");
  // add the capacitive sensor reading to the serial line
  Serial.println(sensorScaled);
  
  // if there's serial data
  if (Serial.available() > 0) {   // if there's serial data
    // read the serial data sent from web
    int inByte = Serial.read();
    // write the serial data to the led pin. If 1 is read, 
    // set the LED to HIGH to turn it on. 
    digitalWrite(LED_PIN, inByte == 1 ? HIGH : LOW);
  }

  // delay to not overload serial
  delay(50);
}