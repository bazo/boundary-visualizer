from dtos import Boundary, CapitalsList, CountriesList
from shapely.geometry import Point, Polygon


def getMainland(
    countryName: str, boundaries: list[Boundary], capitals: CapitalsList
) -> Boundary:
    # if an entry has only one boundary, we can assume it's mainland

    if len(boundaries) == 1:
        return boundaries[0]

    # only 4 countries don't have capitals on mainland so we can hardcode them
    # and test the largest polygon
    if countryName not in capitals:
        return findLargestBoundary(boundaries)

    # and for other countries compare boundaries with coordinates of capitals

    capitalPoint = Point(capitals[countryName][0], capitals[countryName][1])
    for boundary in boundaries:
        polygon = Polygon(boundary.p)
        if polygon.contains(capitalPoint):
            return boundary

    # if nothing found in capitals find the largest polygon again
    return findLargestBoundary(boundaries)


def filterMainlands(
    countriesList: CountriesList, capitals: CapitalsList
) -> CountriesList:
    result: CountriesList = {}

    for country, boundaries in countriesList.items():
        mainland = getMainland(country, boundaries, capitals)
        if mainland:
            result[country] = [mainland]

    return result


def findLargestBoundary(boundaries: list[Boundary]):
    return max(boundaries, key=lambda b: Polygon(b.p).area)
