from dataclasses import dataclass


@dataclass
class Boundary:
    id: str  # boundary id
    p: list[tuple[float, float]]  # list of (lon, lat) tuples


CountriesList = dict[str, list[Boundary]]

CapitalsList = dict[str, tuple[float, float]]
