/*
 * PARQCO – ESP32 parking slot sensor
 * ----------------------------------
 * Reads an HC-SR04 ultrasonic sensor and tells the PARQCO backend whether the
 * slot is occupied. It only sends data when the state CHANGES (plus a heartbeat
 * every 5 minutes), so the network and database are not flooded.
 *
 * Wiring (one sensor per slot):
 *   HC-SR04 VCC  -> 5V (VIN)
 *   HC-SR04 GND  -> GND
 *   HC-SR04 TRIG -> GPIO 5
 *   HC-SR04 ECHO -> GPIO 18  (use a voltage divider: ECHO is 5V, ESP32 pins are 3.3V)
 *
 * Libraries: only the ones bundled with the ESP32 Arduino core (WiFi, HTTPClient).
 */
#include <WiFi.h>
#include <HTTPClient.h>

// ---------- CHANGE THESE ----------
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
// IP address of the computer running the backend (find it with ipconfig / ifconfig)
const char* API_URL       = "http://192.168.1.50:5000/api/sensor-data";
const char* DEVICE_KEY    = "parqco-esp32-secret";   // must match DEVICE_API_KEY in backend/.env
const char* SENSOR_ID     = "SENSOR_A101";           // must match the sensor linked to the slot
// ----------------------------------

const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int OCCUPIED_THRESHOLD_CM = 40;               // closer than this = a car is there
const unsigned long CHECK_EVERY_MS = 1000;
const unsigned long HEARTBEAT_MS = 5UL * 60UL * 1000UL;

int lastState = -1;                                  // -1 = unknown, 0 = empty, 1 = occupied
unsigned long lastSentAt = 0;

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);    // 30 ms timeout
  if (duration == 0) return 999;                     // nothing detected
  return duration * 0.0343 / 2.0;
}

// Average 5 readings to ignore random spikes
int readOccupied() {
  float total = 0;
  for (int i = 0; i < 5; i++) { total += readDistanceCm(); delay(40); }
  return (total / 5.0) < OCCUPIED_THRESHOLD_CM ? 1 : 0;
}

void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nConnected: " + WiFi.localIP().toString());
}

void sendState(int occupied) {
  if (WiFi.status() != WL_CONNECTED) connectWifi();

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  String body = String("{\"sensorId\":\"") + SENSOR_ID + "\",\"occupied\":" + occupied + "}";
  int code = http.POST(body);
  Serial.printf("Sent %s -> HTTP %d\n", body.c_str(), code);
  http.end();
  lastSentAt = millis();
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  connectWifi();
}

void loop() {
  int state = readOccupied();
  bool changed = state != lastState;
  bool heartbeatDue = millis() - lastSentAt > HEARTBEAT_MS;

  if (changed || heartbeatDue) {
    sendState(state);
    lastState = state;
  }
  delay(CHECK_EVERY_MS);
}
