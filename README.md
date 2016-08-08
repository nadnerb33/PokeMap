## PokeMap

Map based analysis of Pokemon Go spawn data. 
[Demo](http://www.nadnerb.co.uk/pokemongo/bath.php)

*Note: This is not a scanner - you must provide your own data.*

## Setup

Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.

## Requirements

* php with SQLite

## Installation

1. Clone to your desired location
2. Load data into Spawns.sqlite (see push_to_db.py for an example of loading [PGO-mapscan-opt](https://github.com/seikur0/PGO-mapscan-opt) Spawns0.txt) or rename Spawns_sample.sqlite to try the demo data
3. (optional) Add your Mapbox token to map.js if you want to use the Pokemon Go style basemap (if left empty it will default to another basemap).
4. Modify the coordinates on line 3 of map.js to your local area.

## Screens

![PokeMap](https://raw.githubusercontent.com/nadnerb33/PokeMap/blob/master/Images/Screen.jpg)



