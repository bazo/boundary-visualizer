from dataclasses import dataclass

@dataclass
class Point:
    lon: float
    lat: float
    
@dataclass
class Boundary:
    code: str
    points: list[Point]

@dataclass
class Country:
    name: str
    boundaries: list[Boundary]

CountryList = dict[str, Country]