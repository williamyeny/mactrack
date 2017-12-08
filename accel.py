# read and interpret accelerometer data

# for accel data
import smbus
import time
# for process killing
import os
import signal
import sys
from subprocess import check_output

# grab process ID of node.js
nodePid = check_output(["pidof","node"])

# get bus
bus = smbus.SMBus(1)

# MMA8452Q address: 0x1C(28)
# control register: 0x2A(42)
#	set to standby mode: 0x00(00)
bus.write_byte_data(0x1C, 0x2A, 0x00)
#	set to active mode: 0x01(01)
bus.write_byte_data(0x1C, 0x2A, 0x01)

# configuration register: 0x0E(14)
bus.write_byte_data(0x1C, 0x0E, 0x00)

# run infinitely
while true:
  time.sleep(0.5)

  # read data
  data = bus.read_i2c_block_data(0x1C, 0x00, 7)

  # convert the data
  xAccel = (data[1] * 256 + data[2]) / 16
  if xAccel > 2047:
    xAccel -= 4096

  yAccel = (data[3] * 256 + data[4]) / 16
  if yAccel > 2047:
    yAccel -= 4096

  zAccel = (data[5] * 256 + data[6]) / 16
  if zAccel > 2047:
    zAccel -= 4096

  # combine for total acceleration
  totalAccel = xAccel + yAccel + zAccel

  # check if total acceleration exceeds arbitrary threshold
  if totalAccel > 500: 
    # kill node.js process
    os.kill(nodePid, signal.SIGTERM)
    # stop script
    sys.exit(0)
