# Solution

## Demo

is accessible on this link https://boundary-visualizer.fly.dev/

### Prerequisites

If you want to run it directly from code:

- python > 3.13
- uv - https://github.com/astral-sh/uv
- taskfile - https://taskfile.dev/
- bun.js - https://bun.com/

UV is used to manage dependencies

```sh
cd server
uv venv
uv sync
```

If you want to use docker:
- docker :)

```sh
task docker
#or
docker build  -t "boundary-visualizer" --progress=plain .
docker run boundary-visualizer
```

## Getting the mainland ids

### Direct installation
```sh
#in server
uv run main.py
```

## Visualizer

the app visualizes the boundaries given in file input/country-borders

### Running visualizer Locally

```sh
task dev
#or
uv run server.py # in server
bun run dev # in web
```

this will launch the api and web separately on their respective ports

BE: http://localhost:8000/
FE: http://localhost:5173/

### Using docker

A dockerfile is provided for convenience

```sh
docker compose up
```

the whole app can be accessed from this url
http://localhost:8000/
