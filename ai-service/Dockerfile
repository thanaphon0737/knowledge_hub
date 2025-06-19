
FROM python:3.10-slim

# --- Set the working directory inside the container ---
# All subsequent commands will be run from this path.
WORKDIR /app

# --- Set environment variables ---
# Prevents Python from writing .pyc files to disk.
ENV PYTHONDONTWRITEBYTECODE 1
# Ensures Python output is sent straight to the terminal without buffering.
ENV PYTHONUNBUFFERED 1

# --- Install dependencies ---
# First, copy only the requirements file.
# This leverages Docker's layer caching. The 'pip install' step will only
# re-run if the requirements.txt file changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Copy the application code into the container ---
# Copy the 'app' directory from your project into the container's /app directory.
COPY ./app /app/app

# --- Expose the port ---
# Tells Docker that the container will listen on port 8000 at runtime.
# This is the default port for Uvicorn.
EXPOSE 8000

# --- Define the command to run the application ---
# This command will be executed when the container starts.
# It runs the Uvicorn server, pointing it to the FastAPI 'app' instance
# inside the 'main.py' file.
# --host 0.0.0.0 makes the server accessible from outside the container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

