import csv
import sys
from dtos import Point, Boundary, Country, CountryList


def readInput(filePath: str) -> CountryList:
    csv.field_size_limit(sys.maxsize)
    countryList: CountryList = {}
    with open(filePath, newline="") as csvfile:
        boundaryReader = csv.reader(csvfile)
        for row in boundaryReader:
            [boundaryId, countryCode, countryName, points] = row
            boundaryId = boundaryId.removeprefix("country:")
            boundary = Boundary(code=boundaryId, points=readPoints(points))
            if countryCode not in countryList:
                countryList[countryCode] = Country(name=countryName, boundaries=[])
            countryList[countryCode].boundaries.append(boundary)

    return countryList


def toPoint(pair) -> Point:
    [lon, lat] = pair.split(" ")
    return Point(lon=float(lon), lat=float(lat))


def readPoints(points: str) -> list[Point]:
    pairs = points.split(":")
    return [toPoint(pair) for pair in pairs]
