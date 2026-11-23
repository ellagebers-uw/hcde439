#include <CapacitiveSensor.h>

const int BUTTON_PIN = 7;
const int LED_PIN = 11;
CapacitiveSensor   cs_s2_r4 = CapacitiveSensor(2,4);
// minimum sensor value
long minVal = 100000;
// maximum sensor value
long maxVal = 0;
// smoothing variable to hold decimals
float smoothed = 0;
//
int sensorScaled = 0;

void setup() {
  Serial.begin(9600);    // initialize serial communications
  Serial.setTimeout(10); // set the timeout for parseInt
  pinMode(LED_PIN, OUTPUT);   // set LED_PIN to an output
  pinMode(BUTTON_PIN, INPUT); // set BUTTON_PIN to an Input
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
  if (csReading >= 0) {{
    csReading = constrain (csReading, minVal, maxVal);
    //smooth the data
    smoothed = 0.9 * smoothed + 0.1 * csReading;
    // apply the calibration to the sensor reading
  }
 
  sensorScaled = map ((long)smoothed, minVal, maxVal, 0, 255);

  Serial.println(digitalRead(BUTTON_PIN));
  Serial.print(",");
  Serial.println(sensorScaled);
  
  if (Serial.available() > 0) {   // if there's serial data
    int inByte = Serial.read();
    digitalWrite(LED_PIN, inByte == 1 ? HIGH : LOW);
  }

  delay(50);
}