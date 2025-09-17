from reader import readInput, readCapitalsList
from logic import filterMainlands

def main():
    countriesList = readInput("../input/country-borders.csv")
    capitalsList = readCapitalsList("../input/all-capital-cities-in-the-world.csv")

    filtered = filterMainlands(countriesList, capitalsList)

    for country, boundaries in filtered.items():
        pass
        #print(f"{country}: {boundaries[0].id}")
        print(boundaries[0].id)

    


if __name__ == "__main__":
    main()
