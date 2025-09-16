import csv
import sys
from dtos import Boundary, CapitalsList, CountriesList


def readInput(filePath: str) -> CountriesList:
    csv.field_size_limit(sys.maxsize)
    countryList: CountriesList = {}
    with open(filePath, newline="", closefd=True) as csvfile:
        boundaryReader = csv.reader(csvfile)
        for row in boundaryReader:
            [boundaryId, _, countryName, points] = row
            boundaryId = boundaryId.removeprefix("country:")
            boundary = Boundary(id=boundaryId, p=readPoints(points))
            if countryName not in countryList:
                countryList[countryName] = []
            countryList[countryName].append(boundary)

    return countryList


def toLonLat(pair) -> tuple[float, float]:
    [lon, lat] = pair.split(" ")
    return float(lon), float(lat)


def readPoints(points: str) -> list[tuple[float, float]]:
    pairs = points.split(":")
    return [toLonLat(pair) for pair in pairs]


def readCapitalsList(filePath: str) -> CapitalsList:
    csv.field_size_limit(sys.maxsize)
    capitalsList: CapitalsList = {}
    with open(filePath, newline="", closefd=True) as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # skip header
        for row in reader:
            print(row)
            [country, capital, lat, lon, _, _] = row
            capitalsList[country] = float(lon), float(lat)

    return capitalsList
