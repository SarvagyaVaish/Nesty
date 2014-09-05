double CurrTemp = 72.0;
double DesrTemp = 72.0;
int Mode = 0; 
    // 0 - Off
    // 1 - Cool
    // 2 - Heat
int FanState = 0;
int CoolState = 0;
int HeatState = 0;

int Hvac_G = D7;
int Hvac_Y = D6;
int Hvac_O = D5;

void setup()
{
    pinMode(Hvac_G, OUTPUT);
    pinMode(Hvac_Y, OUTPUT);
    pinMode(Hvac_O, OUTPUT);
    
    Spark.variable("CurrTemp", &CurrTemp, DOUBLE);
    Spark.variable("DesrTemp", &DesrTemp, DOUBLE);
    Spark.variable("FanState", &FanState, INT);
    Spark.variable("CoolState", &CoolState, INT);
    
    Spark.function("SetDesrTemp", SetDesrTemp);
    Spark.function("SetMode", SetMode);
}

void loop()
{
    int newFanState = 0;
    int newCoolState = 0;
    int newHeatState = 0;
    
    // Off
    if (Mode == 0) {
        // Turn off everything
        newFanState = 0;
        newCoolState = 0;
        newHeatState = 0;
    }
    
    // On and Cool
    else if ( Mode == 1 ) {
        // Default fan state when hvac is on
        newFanState = 1;
        
        // In the process of cooling
        if ( CoolState == 1 ) {
            // Desired temp reached
            if ( CurrTemp < DesrTemp - 0.5 ) {
                newCoolState = 0;
            }
            // Warmer than desired, cooling on
            else {
                newCoolState = 1;
            }
        }
        
        // Cooling was off
        else if ( CoolState == 0 ) {
            // Desired temp not reached
            if ( CurrTemp > DesrTemp + 0.5 ) {
                newCoolState = 1;
            }
            // Cooler than desired, cooling off
            else {
                newCoolState = 0;
            }
        }
    }
    
    
    // Has anything changed?
    bool changedFlag = false;
    
    if (FanState != newFanState) {
        FanState = newFanState;
        changedFlag = true;
    }
    
    if (CoolState != newCoolState) {
        CoolState = newCoolState;
        changedFlag = true;
    }
    
    if (HeatState != newHeatState) {
        HeatState = newHeatState;
        changedFlag = true;
    }
    
    // Update the signals to hvac
    if (changedFlag) {
        
        int Hvac_G_val = 0;
        int Hvac_Y_val = 0;
        int Hvac_O_val = 0;
        
        if (FanState) {
            Hvac_G_val = 1;
        }
        
        if (CoolState) {
            Hvac_Y_val = 1;
            Hvac_O_val = 1;
        }
        
        if (HeatState) {
            Hvac_Y_val = 1;
        }
        
        digitalWrite(Hvac_G, Hvac_G_val);
        digitalWrite(Hvac_Y, Hvac_Y_val);
        digitalWrite(Hvac_O, Hvac_O_val);
        
    }
    
    // Simulator
    if ( CoolState == 1 ) {
        CurrTemp *= 0.999;
        CurrTemp = max(CurrTemp, 65);
    }
    else if ( CoolState == 0 ) {
        CurrTemp *= 1.001;
        CurrTemp = min(CurrTemp, 80);
    }
    
    delay(5000);
}

int SetDesrTemp(String command) 
{
    String temp = command.substring(5, command.length());
    DesrTemp = temp.toInt();
    return DesrTemp;
}

int SetMode(String command) 
{
    if (command.compareTo("cool") == 0) {
        Mode = 1;
    }
    else if (command.compareTo("off") == 0) {
        Mode = 0;
    }
    else if (command.compareTo("heat") == 0) {
        Mode = 2;
    }
    
    return 1;
}
