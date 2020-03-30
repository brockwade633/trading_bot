import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from mpl_finance import candlestick_ohlc
import datetime
import sys

# Get data from command line
data = sys.argv[1].split(',')

# Initialize vars
xmax = 0
xmin = 0
ymax = 0
ymin = 0
timeFrame = 0
cushion = 0
tupleData = []
fig = plt.figure(figsize=(8, 6))
ax = fig.add_axes([0.12, 0.15, 0.8, 0.8])

def defineAxesAndData(barData):
    xdata = []
    ydata = []

    # Discern time period 
    global cushion, timeFrame
    timeFrame = int(barData[5]) - int(barData[0])
    cushion = timeFrame*5

    # parse data for x and y axis specs and format candlestick data
    for i in range(1, len(barData)):
        if (i%5 == 0):
            xdata.append(int(barData[i]))
        if (i%5 != 0):
            ydata.append(float(barData[i]))
        if ((i+1)%5 == 0):
            global tupleData
            tupleData.append((int(barData[i-4]), float(barData[i-3]), float(barData[i-2]), float(barData[i-1]), float(barData[i])))

    # Set max and min axes values
    global xmax
    xmax = max(xdata) + cushion
    global xmin
    xmin = min(xdata) - cushion
    global ymax
    ymax = max(ydata) + 0.05
    global ymin
    ymin = min(ydata) - 0.05

    # Set top and right chart borders
    global ax
    #ax.spines['right'].set_color('none')
    #ax.spines['top'].set_color('none')

    # Set numerical limits for x and y axes
    ax.set_xlim([xmin, xmax])
    ax.set_ylim([ymin, ymax])

    # Set labels for x and y axes
    ax.set_ylabel('Price (USD)', size=12)
    ax.set_xlabel("Time")

def defineTicks():
    xTicks = []
    rawTicks = []

    # formulate actual dates from time data
    for i in range(xmin, xmax, timeFrame):
        date = datetime.datetime.fromtimestamp(i)
        time = formatTime(date)
        xTicks.append(time)
        rawTicks.append(i)

    # Set tick marks and their labels, sizing, etc. 
    global ax
    ax.set_xticks(rawTicks)
    ax.set_xticklabels(xTicks)
    ax.xaxis.set_ticks_position('bottom')
    ax.yaxis.set_ticks_position('left')
    ax.tick_params(axis='both', direction='out', width=2, length=8, labelsize=8, pad=6)
    
def renderPlot(timestamp):
    global ax
    global tupleData
    candlestick_ohlc(ax, tupleData, width=timeFrame-(timeFrame/12), colorup='g', colordown='r')
    global plt
    dateObj = datetime.datetime.fromtimestamp(timestamp)
    plt.title("Potential TBP entry on " + str(dateObj.month) + "/" + str(dateObj.day) + "/" + str(dateObj.year))
    plt.savefig("strategies/TBP/" + str(dateObj.month) + str(dateObj.day) + str(dateObj.year) + '_plot.pdf', bbox_inches='tight')

def formatTime(date):
    minute = ""
    if len(str(date.minute)) == 1:
        minute = "0"+str(date.minute)
    else:
        minute = str(date.minute)
    return str(date.hour) + ":" + minute

defineAxesAndData(data)
defineTicks()
renderPlot(xmin)