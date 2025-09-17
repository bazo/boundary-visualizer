from collections import defaultdict
from shapely.geometry import Polygon, MultiPolygon
from geopandas import GeoDataFrame

def frameToDict(frame: GeoDataFrame) -> dict:
    result = defaultdict(list)

    for row in frame.itertuples():
        geom = row.geometry

        if isinstance(geom, Polygon):
            polygons = [geom]
        elif isinstance(geom, MultiPolygon):
            polygons = list(geom.geoms)
        else:
            continue

        for poly in polygons:
            coords = list(poly.exterior.coords)
            result[row.country].append(
                {"id": row.id, "p": [(float(x), float(y)) for x, y in coords]}
            )

    return dict(result)
