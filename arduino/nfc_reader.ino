#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_PN532.h>

// ========================
//  USER CONFIG
// ========================

// WiFi
const char* WIFI_SSID     = "SJSU_guest";
const char* WIFI_PASSWORD = "";

// Firebase RTDB
const char* FIREBASE_HOST = "https://smartdropboxapp-default-rtdb.firebaseio.com";

// Paths
const char* COURIER_SIGNAL_PATH   = "/devices/box1/courier_signal.json";
const char* HOMEOWNER_SIGNAL_PATH = "/devices/box1/homeowner_signal.json";
const char* STATUS_PATH           = "/devices/box1/status.json";

// Unlock window
const unsigned long UNLOCK_WINDOW_MS = 15000; // 15s window after a request

// ========================
//  PINS
// ========================

// PN532 I2C
#define SDA_PIN 21
#define SCL_PIN 22

// Lock control pin (MOSFET / relay)
#define LOCK_PIN 18

// ========================
//  PN532 + AUTH
// ========================

Adafruit_PN532 nfc(SDA_PIN, SCL_PIN);

uint8_t phoneUID[] = {0x01, 0x02, 0x03, 0x04};       // Android test phone
uint8_t cardUID[]  = {0x31, 0xDA, 0x08, 0x05};       // physical NFC card
const uint8_t phoneUIDLen = 4;
const uint8_t cardUIDLen  = 4;

// What action is pending during the NFC window
enum PendingAction {
  ACTION_NONE,
  ACTION_COURIER_UNLOCK,
  ACTION_HOMEOWNER_UNLOCK,
  ACTION_HOMEOWNER_LOCK
};

PendingAction pendingAction = ACTION_NONE;
unsigned long allowedUntil  = 0;

// ========================
//  GLOBALS
// ========================

WiFiClientSecure secureClient;
unsigned long lastPollTime = 0;
const unsigned long POLL_INTERVAL_MS = 1000;

// ========================
//  HELPERS
// ========================

bool compareUID(const uint8_t* a, const uint8_t* b, uint8_t len) {
  for (uint8_t i = 0; i < len; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}

bool isAuthorizedUID(const uint8_t* uid, uint8_t uidLen) {
  if (uidLen == phoneUIDLen && compareUID(uid, phoneUID, uidLen)) return true;
  if (uidLen == cardUIDLen  && compareUID(uid, cardUID,  uidLen)) return true;
  return false;
}

void updateStatusInFirebase(const char* status) {
  HTTPClient http;
  secureClient.setInsecure();
  String url = String(FIREBASE_HOST) + STATUS_PATH;

  if (http.begin(secureClient, url)) {
    http.addHeader("Content-Type", "application/json");
    String body = String("\"") + status + "\"";
    int code = http.PUT(body);
    Serial.printf("Status update (%s) HTTP %d\n", status, code);
    http.end();
  } else {
    Serial.println("Failed to begin HTTP for status update");
  }
}

// Pulse the lock (same hardware action for lock/unlock, but we track logical state)
void pulseLockAndSetStatus(const char* newStatus) {
  Serial.printf("🔔 Pulsing lock, new logical status: %s\n", newStatus);
  digitalWrite(LOCK_PIN, HIGH);
  delay(3000);
  digitalWrite(LOCK_PIN, LOW);

  updateStatusInFirebase(newStatus);
}

// ========================
//  FIREBASE POLLING
// ========================

void pollCourierSignal() {
  HTTPClient http;
  secureClient.setInsecure();
  String url = String(FIREBASE_HOST) + COURIER_SIGNAL_PATH;

  if (!http.begin(secureClient, url)) {
    Serial.println("❌ HTTP begin failed (courier_signal)");
    return;
  }

  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    payload.trim();
    Serial.print("Courier signal = ");
    Serial.println(payload);

    if (payload.indexOf("ARRIVED") != -1) {
      Serial.println("🚚 Courier ARRIVED → opening NFC window for courier.");
      allowedUntil = millis() + UNLOCK_WINDOW_MS;
      pendingAction = ACTION_COURIER_UNLOCK;

      // Reset courier_signal to "WAITING"
      HTTPClient http2;
      secureClient.setInsecure();
      if (http2.begin(secureClient, url)) {
        http2.addHeader("Content-Type", "application/json");
        http2.PUT("\"WAITING\"");
        http2.end();
      }
    }
  } else {
    Serial.printf("Error GET courier_signal: %s\n", http.errorToString(code).c_str());
  }

  http.end();
}

void pollHomeownerSignal() {
  HTTPClient http;
  secureClient.setInsecure();
  String url = String(FIREBASE_HOST) + HOMEOWNER_SIGNAL_PATH;

  if (!http.begin(secureClient, url)) {
    Serial.println("❌ HTTP begin failed (homeowner_signal)");
    return;
  }

  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    payload.trim();
    Serial.print("Homeowner signal = ");
    Serial.println(payload);

    if (payload.indexOf("UNLOCK_REQUEST") != -1) {
      Serial.println("🏠 Homeowner requested UNLOCK → opening NFC window.");
      allowedUntil = millis() + UNLOCK_WINDOW_MS;
      pendingAction = ACTION_HOMEOWNER_UNLOCK;

      // clear signal
      HTTPClient http2;
      secureClient.setInsecure();
      if (http2.begin(secureClient, url)) {
        http2.addHeader("Content-Type", "application/json");
        http2.PUT("\"NONE\"");
        http2.end();
      }
    } else if (payload.indexOf("LOCK_REQUEST") != -1) {
      Serial.println("🏠 Homeowner requested LOCK → opening NFC window.");
      allowedUntil = millis() + UNLOCK_WINDOW_MS;
      pendingAction = ACTION_HOMEOWNER_LOCK;

      // clear signal
      HTTPClient http2;
      secureClient.setInsecure();
      if (http2.begin(secureClient, url)) {
        http2.addHeader("Content-Type", "application/json");
        http2.PUT("\"NONE\"");
        http2.end();
      }
    }
  } else {
    Serial.printf("Error GET homeowner_signal: %s\n", http.errorToString(code).c_str());
  }

  http.end();
}

void pollFirebase() {
  unsigned long now = millis();
  if (now - lastPollTime < POLL_INTERVAL_MS) return;
  lastPollTime = now;

  pollCourierSignal();
  pollHomeownerSignal();
}

// ========================
//  SETUP
// ========================

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, LOW); // locked by default

  // WiFi
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected.");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // PN532
  Serial.println("Initializing PN532 (I2C)...");
  nfc.begin();
  uint32_t versiondata = nfc.getFirmwareVersion();
  if (!versiondata) {
    Serial.println("❌ PN532 not found! Check wiring / I2C mode.");
    while (1) delay(1000);
  }
  Serial.print("PN532 Firmware: 0x");
  Serial.println(versiondata, HEX);
  nfc.SAMConfig();
  Serial.println("NFC reader ready.");

  // Initial status (optional)
  updateStatusInFirebase("LOCKED");
}

// ========================
//  MAIN LOOP
// ========================

void loop() {
  // 1) Poll Firebase for courier/homeowner signals
  pollFirebase();

  // 2) Check for NFC tag
  uint8_t uid[7];
  uint8_t uidLength;
  bool success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength);

  if (success) {
    Serial.print("Tag detected! UID: ");
    for (uint8_t i = 0; i < uidLength; i++) {
      Serial.print(uid[i], HEX);
      Serial.print(" ");
    }
    Serial.println();

    bool windowActive = (millis() < allowedUntil);

    if (!windowActive || pendingAction == ACTION_NONE) {
      Serial.println("⛔ No active NFC window. Ignoring tag.");
    } else if (!isAuthorizedUID(uid, uidLength)) {
      Serial.println("❌ Tag not authorized for this box.");
    } else {
      // Authorized + window active → execute action
      switch (pendingAction) {
        case ACTION_COURIER_UNLOCK:
          Serial.println("✅ Courier authorized — unlocking box.");
          pulseLockAndSetStatus("LOCKED"); // mechanically a pulse; status stays LOCKED
          break;

        case ACTION_HOMEOWNER_UNLOCK:
          Serial.println("✅ Homeowner authorized — unlocking box.");
          pulseLockAndSetStatus("UNLOCKED");
          break;

        case ACTION_HOMEOWNER_LOCK:
          Serial.println("✅ Homeowner authorized — locking box.");
          pulseLockAndSetStatus("LOCKED");
          break;

        default:
          break;
      }

      // Close the window after one successful NFC scan
      pendingAction = ACTION_NONE;
      allowedUntil  = 0;
    }

    delay(1200); // debounce
  }

  delay(50);
}
