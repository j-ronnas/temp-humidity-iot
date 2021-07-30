# Tutorial: Building your own IoT weather sensor with Node JS

*By Johan Ronnås, jr22rbr*

This project consists of a temperature sensor and a humidity sensor which will monitor weather conditions. The data is sent to a custom node js server and presented on a simple website using HTML, CSS and JS. 


## Objective

As more and more devices are getting "smarter" there are already many weather stations available with online functionality. These devices come with their own dashboards and interfaces for viewing the collected weather data. However, by building our own custom device we get full control of how the data is stored and presented, giving us the oppertunity to view the statistics that we are interrested in. We also have the oppertunity to expand the weather station with other components and sensors as we see fit. 

A secondary objective of this project is that it serves as a learning project. By writing our own node js server we can get a good understanding of all the different steps and aspects involved in IoT: measuring the data, transmitting it from a device, handling the request, storing data in a database and finally presenting it to the user. 



Device name | Description | Price | Link to buy
------------ | -------------| -------------| -------------
LoPy4 | Microcontroller
Expansion board | Allows for more connections
Digital temperature and humidity sensor DHT11 |
Breadboard |
Jumper wires |

## Part 1: Setup

Before writing any code or connecting any components, there are somethings that need to be setup.

### 1.1 Install Node JS

Node JS is both needed in order to write the javascript server, as well as to get the LoPy4 up and running. Simply install the version you need from https://nodejs.org/en/. (I used 14.17.3 LTS for windows). Make sure that you include the node package manager (npm) in your installation as it is needed for setting up the server. 

### 1.2 Install and configure your IDE (VS Code)

We need an IDE with functionality to upload code to the LoPy4 device. I use VS Code, (https://code.visualstudio.com/) as it is easy to install all the required extensions as well as I can use it for writing in multiple langugages, including python and javascript. 

For writing and uploading python code to run on the LoPy4 device we need the Pymakr extension. Simply search for it under the extensions-tab and install it. More detailed instructions can be found here: https://code.visualstudio.com/

### 1.3 Folder structure

The code will consists of three parts, so let's create three folders:
* weather-sensor
* weather-server
* weather-web-display

## Part 2: Connecting Components

## Part 3: Server Code

The server is responsible for responding to requests made by the LoPy4 and storing the received weather data, as well as serving it to the webclient for displaying. You can find the complete server code on the github repo.

### 3.1 Setup

First of all we need to initialize the node project using npm, by writing in our terminal `npm init` when standing in the weather-server folder. We will be prompted by several questions to configure the project. We can leave these as the default settings. A quicker way is writing `npm init -y` which will answer yes to all questions. 

We will than install express, a framework for creating web applications that will make it easy to handle http requests, by running `npm install express`. Then we create a file called index.js (as this is the default name for the starting point of node project setup by npm). In this file we need to import the express package and set it up and running:

```javascript
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000);
```

`app.use(express.urlencoded({ extended: true }));` tells express how it will intepret the data being sent to the server. Using `express.urlencoded({ extended: true })` will let us simply send a python object from the LoPy4 without having to do much extra work.

The express app then listens to port 3000, which is just chosen arbitrarily. By including ´process.env.PORT´ if it is available, the server can be run on a remote location, such as a hosting service, where the port will be read from the environment.

### 3.2 Database configuration

### 3.3 Handling lopy request

We can then set up the handling of a post-request from the lopy device. Here we receive the data in the body of the request and we add it to the database. 

```javascript
app.post("/senddata", (request, response) => {
    console.log("Params received");
    console.log(request.body);
    console.log("Temperature:" + request.body["TEMP"]);
    console.log("Humidity:" + request.body["RH"]);
    
    //Perhaps do some editing of data before writing to db?
    doc = {
        time : request.body["TIME"],
        temp : request.body["TEMP"],
        rh: request.body["RH"]
    }
    db.insert(doc);
    
    response.json("Data sent was successful");
});
```




## Part 4: Device Code

The lopy device is responsible for reading the data from the humidity and temperature sensor and sending it to the server. We will use a wifi connection as this makes it easy to send http requests to the server. This however limits the placement and functionality of the device as it will require wifi coverage. Other options are available such as LoRa and Sigfox depending on where the device will be located.

The code on the lopy device will be structured in 4 parts within the weather-sensor folder. 
* *lib* - a folder containing all libraries used
* *keys.py* - contains sensitive data specific to the network connection
* *boot.py* - script that runs during startup 
* *main.py* - the main script which will continously run

### 4.1 boot.py

In boot.py we will setup the device by connecting to Wifi. Note that the wifi ssid and the password is stored in variables definied in keys.py
```python
wlan = WLAN(mode=WLAN.STA)

nets = wlan.scan()
for net in nets:
    if net.ssid == keys.wifi_ssid:
        print('Network found!', net.ssid)
        wlan.connect(net.ssid, auth=(net.sec, keys.wifi_password), timeout=5000)
        while not wlan.isconnected():
            machine.idle() # save power while waiting
        print('WLAN connection succeeded!')
        print(wlan.ifconfig())
        break

```

We also setup functionality to log the time as this will sent along the sensor readings to the server. This is done using `machine.RTC()` (RTC stands for real time clock) and syncing it to pool.ntp.org, a timeserver which is simple to use. (Read more here: https://www.ntppool.org/en/)

```python
rtc = machine.RTC()
print(rtc)
rtc.ntp_sync("pool.ntp.org")
while not rtc.synced():
    print("not synced")
    machine.idle()
print("RTC synced with NTP time")
#adjust your local timezone, by default, NTP time will be GMT
time.timezone(2*60**2) #we are located at GMT+2, thus 2*60*60
print(time.localtime())
```

### 4.2 main.py

The main functionality of the lopy is to read the sensor data and send it to the server. The data is read using a library gotten at https://github.com/JurassicPork/DHT_PyCom. The device is setup by specifiyng the pin and mode, and then the values are read continously in a while loop.
```python
from dht import DHT # https://github.com/JurassicPork/DHT_PyCom

# Type 0 = dht11
# Type 1 = dht22

th = DHT(Pin('P20', mode=Pin.OPEN_DRAIN), 0)

time.sleep(2)

while True:
    result = th.read()
    while not result.is_valid():
        time.sleep(.5)
        result = th.read()
    print('Temp:', result.temperature)
    print('RH:', result.humidity)
    
    # Send data in http request...
``` 
To send the data to the server we use a library called urequests (https://makeblock-micropython-api.readthedocs.io/en/latest/public_library/Third-party-libraries/urequests.html). This is the micropython version of the request library which handles http requests, which is installed by simply putting the urequests.py file in the lib-folder. The data from the sensor is put into an object and sent as a post request to the server. I chose to send every ten minutes, but this can be varied to suit your needs. In the post request we specify the IP-address of the server, as well as the port. Here I am using the local ip address of the computer that is running the server togheter with the port number I specified (3000). This will work as long as the lopy device is connected to the same local network as the server. If you would like access the server outside the local network you will need to either host it using a hosting service or setup your own webserver. You can then use the address of this remote server in the http request.

```
from lib import urequests as requests

while True:
    # Read data from sensor...

    dhtdata = {
        'TIME':(time.time()),
        'TEMP': str(result.temperature),
        'RH': str(result.humidity)
    }
    res = requests.post('http://192.168.3.121:3000/senddata',  data = dhtdata)
    print("Post request sent")
    print(res)
    print(res.text)
    time.sleep(10*60)

```

## Part 5: HTML Website

