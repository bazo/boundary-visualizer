from fastapi import FastAPI
from logic import filterMainlands
from reader import readInput, readCapitalsList
from fastapi.middleware.cors import CORSMiddleware
import geopandas as gpd
import pandas as pd
from shapely.geometry import Polygon, box
from utils import frameToDict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def index(bbox: str = "-90,-45,90,45", mainLandOnly: bool = False) -> dict:
    countryList = readInput("../input/country-borders.csv")
    capitalsList = readCapitalsList("../input/all-capital-cities-in-the-world.csv")

    filtered = countryList

    if mainLandOnly:
        filtered = filterMainlands(filtered, capitalsList)

    records = [
        {"country": country, "id": poly.id, "geometry": Polygon(poly.p)}
        for country, polys in filtered.items()
        for poly in polys
    ]

    # DataFrame → GeoDataFrame
    gdf = gpd.GeoDataFrame(pd.DataFrame.from_records(records), crs="EPSG:4326")

    # bounding box
    coords = list(map(float, bbox.split(",")))
    query_bounds = box(minx=coords[0], miny=coords[1], maxx=coords[2], maxy=coords[3])

    # filter podľa intersects
    intersected = gdf[gdf.intersects(query_bounds)]

    return frameToDict(intersected)
