from reader import readInput, readCapitalsList
from logic import getMainland

def main():
    countryList = readInput("../input/country-borders.csv")
    capitalsList = readCapitalsList("../input/all-capital-cities-in-the-world.csv")

    for country, boundaries in countryList.items():
        mainland = getMainland(country, boundaries, capitalsList)
        if mainland:
            #print("")
            print(f"{country}: {mainland.id}")
        else:
            #print("")
            print(f"{country}: no mainland found")

    


if __name__ == "__main__":
    main()
