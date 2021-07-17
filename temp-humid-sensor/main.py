from lib import urequests as requests
import time
from machine import Pin
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
    
    dhtdata = {
        'TIME':(time.time()),
        'TEMP': str(result.temperature),
        'RH': str(result.humidity)
    }
    #TODO: handle when http request dosnt work
    res = requests.post('http://192.168.3.121:3000/senddata',  data = dhtdata)
    print("Post request sent")
    print(res)
    print(res.text)
    time.sleep(10*60)





res = requests.post('http://192.168.3.121:3000/senddata',  data = {"key": "value"})
print("Post request sent")
print(res)
print(res.text)