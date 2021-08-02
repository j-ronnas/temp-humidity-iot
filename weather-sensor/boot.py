# boot.py -- run on boot-up
from network import WLAN
import machine
import keys
import time
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