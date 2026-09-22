# FlowLab Air Resistance Studio

A browser-based 3D airflow visualizer built with Flask and Babylon.js. Rotate and inspect a 3D model, change wind conditions, and view an estimated aerodynamic drag value alongside animated flow lines.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000` in a browser.

## Features

- Orbit, zoom, and pan around a 3D scene using the mouse.
- Import `.glb`, `.gltf`, `.obj`, or `.stl` model files from the side panel.
- Tune wind speed, wind direction, air density, and model rotation.
- Animated streamlines react to the selected wind direction.
- Export the current simulation inputs and estimated drag result as JSON.

> The displayed drag is an interactive engineering estimate using `F = ½ρv²CdA`, not a computational fluid-dynamics (CFD) result. Accurate CFD requires a meshed model and a dedicated fluid solver.
