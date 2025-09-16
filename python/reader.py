import csv
import sys
from dtos import Boundary, CountryList


def readInput(filePath: str) -> CountryList:
    csv.field_size_limit(sys.maxsize)
    countryList: CountryList = {}
    with open(filePath, newline="") as csvfile:
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
