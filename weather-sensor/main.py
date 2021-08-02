from lib import urequests as requests
import time
from machine import Pin
from dht import DHT # https://github.com/JurassicPork/DHT_PyCom

# Type 0 = dht11
# Type 1 = dht22

th = DHT(Pin('P20', mode=Pin.OPEN_DRAIN), 0)
time.sleep(2)

while True:
    #Read temperature and humidity
    result = th.read()
    while not result.is_valid():
        time.sleep(.5)
        result = th.read()
    print('Temp:', result.temperature)
    print('RH:', result.humidity)
    
    #Create structure for values
    dhtdata = {
        'TIME':(time.time()),
        'TEMP': str(result.temperature),
        'RH': str(result.humidity)
    }

    #Send http request with data
    res = requests.post('192.168.3.125:3000/senddata',  data = dhtdata)
    print("Post request sent")

    #Print result for confirmation
    print(res.text)

    #Wait 10 minutes
    time.sleep(10*60)
