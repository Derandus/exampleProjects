// include the library code:
#include <LiquidCrystal.h>
#include "Sodaq_DS3231.h"
#include <Servo.h>
#include <Wire.h>


// initialize the library with the numbers of the interface pins
//           lcd(RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(12, 11, 9, 8, 7, 6);

// Helper enum to clean things up
typedef enum {
    TIME,
    ALARM,
    SET_TIME,
    SET_ALARM,
    RINGING
} ClockState;
///////////////////////////////////////////

// Initialize c_mode
ClockState c_mode = TIME;
///////////////////////////////////////////

// The different times that are used
DateTime nowAlarm;
DateTime newAlarm;
DateTime nowTime;
DateTime newTime;
///////////////////////////////////////////

// Helper variables for the buttons
unsigned long newMillis = 0;
unsigned long oldMillis = 0;
///////////////////////////////////////////

// Initialize hours and minutes
uint8_t hh = 0;
uint8_t mm = 0;
///////////////////////////////////////////

// Define the servo with its start and end position
Servo servo;
const int servoStart = 10;
const int servoEnd = 60;
boolean isMoving = false;
///////////////////////////////////////////

// Define the pins used in this setup
const int buzzerPin = 10;
const int alarmButtonPin = 13;
const int mButtonPin = A1;
const int hButtonPin = 5;
const int setButtonPin = 4;
const int switchPin = 2;
///////////////////////////////////////////

// Define booleans for program flow
boolean setButtonPressed = false;
boolean alarmButtonPressed = false;
boolean mButtonPressed = false;
boolean hButtonPressed = false;
boolean switchOn = false;
boolean isRinging = false;
///////////////////////////////////////////



/**
 * Set all the pins. Activate servo. Check buttons and put clock into correct state.
 */
void setup()
{
    pinMode(buzzerPin, OUTPUT);
    pinMode(setButtonPin, INPUT);
    pinMode(mButtonPin, INPUT);
    pinMode(hButtonPin, INPUT);
    pinMode(alarmButtonPin, INPUT);
    pinMode(switchPin, INPUT);

    servo.attach(3);
    servo.write(servoStart);
    
    if(digitalRead(switchPin) == LOW) {
        switchOn = true;
    }
    if(digitalRead(setButtonPin) == HIGH) {
        setButtonPressed = true;
    }
    if(digitalRead(mButtonPin) == HIGH) {
        mButtonPressed = true;
    }
    if(digitalRead(hButtonPin) == HIGH) {
        hButtonPressed = true;
    }
    if(digitalRead(alarmButtonPin) == HIGH) {
        alarmButtonPressed = true;
    }

    // Initialize the rtc object
    lcd.begin(16, 2);
    Wire.begin();
    rtc.begin();
    nowTime = rtc.now();
    newTime = nowTime;
    hh = nowTime.hour();
    mm = nowTime.minute();
}

/**
 * Get current time. Depending on user interaction decide what to do.
 * Wait 1 ms for stability purposes
 */
void loop()
{
    nowTime = rtc.now();
    checkSwitch();
    checkSetButton();
    checkAlarmButton();
    performMode();
    delay(1);
}

/**
 * Depending on what mode the clock is in and what user interaction has happened
 * perform action relating to changing mode and turning on or off alarm
 */
void performMode() { // Call from loop
    if(nowAlarm.hour() == nowTime.hour() && nowAlarm.minute() == nowTime.minute() && nowAlarm.second() == nowTime.second()) {
        c_mode = RINGING;
        newMillis = millis();
        oldMillis = newMillis;      
    }
    if(c_mode == RINGING) {
        playAlarm();
        servoRelease();
        newMillis = millis();
        if(newMillis - oldMillis > 1000) {
            servoBlock();
        }
    }
    if(c_mode == TIME) {
        displayTime();
    } else if(c_mode == ALARM) {
        displayAlarmTime();
    } else if(c_mode == SET_TIME) {
        checkMButton();
        checkHButton();
        displaySetTime();
    } else if(c_mode == SET_ALARM) {
        checkMButton();
        checkHButton();
        displaySetAlarm();
    }
}

/**
 * Checks to see if switch changed position
 */
void checkSwitch() { // Call from loop
    if(digitalRead(switchPin) == HIGH && !switchOn) {
        c_mode = TIME;
        switchOn = true;
    } else if(digitalRead(switchPin) == LOW && switchOn) {
        c_mode = ALARM;
        switchOn = false;
    }
}

/**
 * Checks if set button is pressed and puts clock into appropriate state.
 */
void checkSetButton() { // Call from loop
    if(digitalRead(setButtonPin) == HIGH && !setButtonPressed){
        setButtonPressed = true;
        if(c_mode == TIME || c_mode == ALARM){
            if(c_mode == TIME) {
                hh = nowTime.hour();
                mm = nowTime.minute();
                c_mode = SET_TIME;
            } else if(c_mode == ALARM) {
                hh = nowAlarm.hour();
                mm = nowAlarm.minute();
                c_mode = SET_ALARM;
            }
        } else if(c_mode == SET_TIME || c_mode == SET_ALARM){
            if(c_mode == SET_TIME) {
                updateTime();
                c_mode = TIME;
            } else {
                updateAlarm();
                c_mode = ALARM;
            }
        }
    } 
    if(digitalRead(setButtonPin) == LOW && setButtonPressed){
        setButtonPressed = false;
    }
}

/**
 * Checks if minute button is pressed. if pressed increment global minute.
 */
void checkMButton() {
    if(digitalRead(mButtonPin) == HIGH && mButtonPressed){
        if(mm == 59)
        {
            mm = 0;
        }
        else
        {
            mm += 1;
        }
        mButtonPressed = false;
    }
    else if(digitalRead(mButtonPin) == LOW && !mButtonPressed){
        mButtonPressed = true;
    }   
}

/**
 * Checks if hour button is pressed. if pressed increment global hour.
 */
void checkHButton() {
    if(digitalRead(hButtonPin) == HIGH && hButtonPressed){
        if(hh == 23)
        {
            hh = 0;
        }
        else
        {
            hh += 1;
        }
        hButtonPressed = false;
    }
    else if(digitalRead(hButtonPin) == LOW && !hButtonPressed){
        //playAlarm();
        hButtonPressed = true;
    } 
}

/**
 * Checks if alarm button is pressed. Used to stop alarm
 */
void checkAlarmButton() {
    if(digitalRead(alarmButtonPin) == HIGH && alarmButtonPressed){
        stopAlarm();
        alarmButtonPressed = false;
    }
    else if(digitalRead(alarmButtonPin) == LOW && !alarmButtonPressed){
        alarmButtonPressed = true;
    }
}

/**
 * Helper method to move servo
 */
void servoRelease() {
    if(isMoving) {
       return; 
    }
    servo.write(servoEnd);
    isMoving = true;
}

/**
 * Helper method to stop servo
 */
void servoBlock() {
    servo.write(servoStart);
    isMoving = false;
    c_mode = TIME;
}

/**
 * Helper method to play alarm sound (1 kHz)
 */
void playAlarm() {
    if(isRinging)
        return;
    newMillis = millis();
    oldMillis = newMillis;
    tone(buzzerPin, 1000);
    isRinging = true;
}

/**
 * Helper method to stop alarm sound
 */
void stopAlarm() {
    noTone(buzzerPin);
    isRinging = false;
}

/**
 * Helper method to display the set alarm time
 */
void displayAlarmTime(){
    lcd.setCursor(0,0);
    lcd.print("Alarm    ");
    lcd.setCursor(0,1);
    lcd.print(alarmToString(nowAlarm.hour(), nowAlarm.minute()));
}

/**
 * Helper method to display the current time
 */
void displayTime() {
    lcd.setCursor(0,0);
    lcd.print("Time     ");
    lcd.setCursor(0,1);
    lcd.print(timeToString(nowTime.hour(), nowTime.minute(), nowTime.second()));  
}

/**
 * Helper method to display the set time when editing time.
 */
void displaySetTime(){
    lcd.setCursor(0,0);
    lcd.print("Set Time ");
    lcd.setCursor(0,1);
    lcd.print(timeToString(hh, mm, nowTime.second()));  
}

/**
 * Helper method to display the set alarm time when editing alarm time.
 */
void displaySetAlarm(){
    lcd.setCursor(0,0);
    lcd.print("Set Alarm");
    lcd.setCursor(0,1);
    lcd.print(alarmToString(hh, mm));
}

/**
 * Conversion of time to string so output can be handled properly by lcd display
 */
String timeToString(uint8_t hh, uint8_t mm, uint8_t ss){
    String out = "";
    if(hh < 10){
        out = out + "0";
    } 
    out = out + String(hh);
    out = out + ":";
    if(mm < 10) {
        out = out + "0";
    }
    out = out + String(mm);
    out = out + ":";
    if(ss < 10) {
        out = out + "0";
    }
    out = out + String(ss);
    return out;
}

/**
 * Conversion of alarm time to string so output can be handled properly by lcd display
 */
String alarmToString(uint8_t hh, uint8_t mm){
    String out = "";
    if(hh < 10){
        out = out + "0";
    } 
    out = out + String(hh);
    out = out + ":";
    if(mm < 10) {
        out = out + "0";
    }
    out = out + String(mm);
    out = out + "   ";
    return out;
}

/**
 * Helper method to update time.
 */
void updateTime(){
    newTime = DateTime(nowTime.year(), nowTime.month(), nowTime.date(), hh, mm, nowTime.second(), nowTime.dayOfWeek());
    rtc.setDateTime(newTime);
}

/**
 * Helper method to update alarm time.
 */
void updateAlarm(){
    nowAlarm = DateTime(nowAlarm.year(), nowAlarm.month(), nowAlarm.date(), hh, mm, 0, nowAlarm.dayOfWeek());
}


