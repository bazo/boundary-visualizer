from dataclasses import dataclass


@dataclass
class Boundary:
    id: str # boundary id
    p: list[tuple[float, float]] # list of (lon, lat) tuples


Country = list[Boundary]

CountriesList = dict[str, Country]

CapitalsList = dict[str, tuple[float, float]]
